"use client";

import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: { r: number; g: number; b: number };
}

export type ParticleBadgeProps = ComponentProps<"div"> & {
  children: ReactNode;
  /** Extra canvas bleed around the badge for particles. */
  bleed?: number;
};

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function ParticleBadge({
  children,
  className,
  bleed = 64,
  ...props
}: ParticleBadgeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const emitIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const getColors = useCallback((bright = false) => {
    if (bright) {
      return [
        { r: 150, g: 240, b: 255 },
        { r: 180, g: 250, b: 255 },
        { r: 200, g: 255, b: 255 },
      ];
    }

    return [
      { r: 119, g: 222, b: 232 },
      { r: 100, g: 200, b: 220 },
      { r: 80, g: 180, b: 200 },
    ];
  }, []);

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return false;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });

    if (!gl) {
      return false;
    }

    const vertexShader = compileShader(
      gl,
      gl.VERTEX_SHADER,
      `
      attribute vec2 a_position;
      attribute float a_size;
      attribute vec4 a_color;
      varying vec4 v_color;
      uniform vec2 u_resolution;

      void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        gl_PointSize = a_size;
        v_color = a_color;
      }
    `
    );

    const fragmentShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      varying vec4 v_color;

      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);

        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        alpha *= v_color.a;

        float glow = exp(-dist * 4.0) * 0.6;

        gl_FragColor = vec4(v_color.rgb, alpha + glow * v_color.a);
      }
    `
    );

    if (!(vertexShader && fragmentShader)) {
      return false;
    }

    const program = gl.createProgram();
    if (!program) {
      return false;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return false;
    }

    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API, not a React hook
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    glRef.current = gl;
    programRef.current = program;

    return true;
  }, []);

  const createParticle = useCallback(
    (x: number, y: number, bright = false): Particle => {
      const colors = getColors(bright);
      const color = colors[Math.floor(Math.random() * colors.length)] ?? {
        r: 119,
        g: 222,
        b: 232,
      };
      const angle = Math.random() * Math.PI * 2;
      const speed = bright ? 0.8 + Math.random() * 2 : 0.2 + Math.random() * 1;
      const maxLife = bright
        ? 50 + Math.random() * 50
        : 70 + Math.random() * 80;

      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (bright ? 1 : 0.2),
        life: maxLife,
        maxLife,
        size: bright ? 2 + Math.random() * 5 : 1 + Math.random() * 3,
        color,
      };
    },
    [getColors]
  );

  const emitFromEdges = useCallback(
    (aggressive = false) => {
      const target = targetRef.current;
      const container = containerRef.current;
      if (!(target && container)) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const offsetX = targetRect.left - containerRect.left;
      const offsetY = targetRect.top - containerRect.top;
      const targetWidth = targetRect.width;
      const targetHeight = targetRect.height;
      const particleCount = aggressive ? 4 : 2;

      for (let index = 0; index < particleCount; index++) {
        const edge = Math.floor(Math.random() * 4);
        let x = offsetX;
        let y = offsetY;

        switch (edge) {
          case 0:
            x = offsetX + Math.random() * targetWidth;
            y = offsetY;
            break;
          case 1:
            x = offsetX + targetWidth;
            y = offsetY + Math.random() * targetHeight;
            break;
          case 2:
            x = offsetX + Math.random() * targetWidth;
            y = offsetY + targetHeight;
            break;
          default:
            x = offsetX;
            y = offsetY + Math.random() * targetHeight;
            break;
        }

        particlesRef.current.push(createParticle(x, y, aggressive));
      }

      if (particlesRef.current.length > 400) {
        particlesRef.current = particlesRef.current.slice(-400);
      }
    },
    [createParticle]
  );

  const render = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;

    if (!(gl && program && canvas)) {
      animationFrameRef.current = requestAnimationFrame(render);
      return;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    particlesRef.current = particlesRef.current.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.015;
      particle.vx *= 0.995;
      particle.life--;
      return particle.life > 0;
    });

    if (particlesRef.current.length > 0) {
      const dpr = window.devicePixelRatio || 1;
      const positions: number[] = [];
      const sizes: number[] = [];
      const colors: number[] = [];

      for (const particle of particlesRef.current) {
        const alpha = (particle.life / particle.maxLife) * 0.9;
        positions.push(particle.x * dpr, particle.y * dpr);
        sizes.push(
          particle.size * dpr * (particle.life / particle.maxLife + 0.5)
        );
        colors.push(
          particle.color.r / 255,
          particle.color.g / 255,
          particle.color.b / 255,
          alpha
        );
      }

      const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW
      );
      const positionLocation = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      const sizeBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.STATIC_DRAW);
      const sizeLocation = gl.getAttribLocation(program, "a_size");
      gl.enableVertexAttribArray(sizeLocation);
      gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);

      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
      const colorLocation = gl.getAttribLocation(program, "a_color");
      gl.enableVertexAttribArray(colorLocation);
      gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.POINTS, 0, particlesRef.current.length);

      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(sizeBuffer);
      gl.deleteBuffer(colorBuffer);
    }

    animationFrameRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!(canvas && container)) {
      return;
    }

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      if (glRef.current) {
        glRef.current.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    initWebGL();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initWebGL, render]);

  useEffect(() => {
    emitIntervalRef.current = setInterval(
      () => {
        emitFromEdges(isHovering);
      },
      isHovering ? 30 : 60
    );

    return () => {
      if (emitIntervalRef.current) {
        clearInterval(emitIntervalRef.current);
      }
    };
  }, [emitFromEdges, isHovering]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) {
      return;
    }

    const onEnter = () => setIsHovering(true);
    const onLeave = () => setIsHovering(false);

    target.addEventListener("mouseenter", onEnter);
    target.addEventListener("mouseleave", onLeave);

    return () => {
      target.removeEventListener("mouseenter", onEnter);
      target.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative isolate inline-flex items-center justify-center overflow-visible",
        className
      )}
      ref={containerRef}
      style={{ padding: bleed }}
      {...props}
    >
      <canvas
        className="pointer-events-none absolute inset-0 z-0"
        ref={canvasRef}
      />
      <div className="relative z-10 inline-flex items-center" ref={targetRef}>
        {children}
      </div>
    </div>
  );
}
