"use client";

import { useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
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

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const CHART_INDIGO_FALLBACK: Rgb = { r: 129, g: 140, b: 248 };
const RGB_COLOR_PATTERN = /rgba?\((\d+),\s*(\d+),\s*(\d+)/;

function parseRgbString(color: string): Rgb | null {
  const match = color.match(RGB_COLOR_PATTERN);
  if (!match) {
    return null;
  }

  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
  };
}

function mixRgb(from: Rgb, to: Rgb, amount: number): Rgb {
  return {
    r: Math.round(from.r + (to.r - from.r) * amount),
    g: Math.round(from.g + (to.g - from.g) * amount),
    b: Math.round(from.b + (to.b - from.b) * amount),
  };
}

function buildParticlePalettes(primary: Rgb): { normal: Rgb[]; bright: Rgb[] } {
  const white: Rgb = { r: 255, g: 255, b: 255 };
  const black: Rgb = { r: 0, g: 0, b: 0 };

  return {
    normal: [
      mixRgb(primary, black, 0.12),
      primary,
      mixRgb(primary, white, 0.08),
    ],
    bright: [
      mixRgb(primary, white, 0.55),
      mixRgb(primary, white, 0.4),
      mixRgb(primary, white, 0.25),
    ],
  };
}

function readChartPrimaryRgbFromProbe(probe: HTMLElement): Rgb {
  return parseRgbString(getComputedStyle(probe).color) ?? CHART_INDIGO_FALLBACK;
}

interface GlState {
  positionBuffer: WebGLBuffer;
  sizeBuffer: WebGLBuffer;
  colorBuffer: WebGLBuffer;
  resolutionLocation: WebGLUniformLocation | null;
  positionLocation: number;
  sizeLocation: number;
  colorLocation: number;
}

export type ParticleBadgeProps = ComponentProps<"div"> & {
  children: ReactNode;
  /** Extra canvas bleed around the badge for particles. */
  bleed?: number;
  /** Keep ambient particle emission; do not boost on hover. */
  disableHover?: boolean;
  /** Pause WebGL loop and emission (e.g. when hero leaves viewport). */
  paused?: boolean;
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
  disableHover = false,
  paused = false,
  ...props
}: ParticleBadgeProps) {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const colorProbeRef = useRef<HTMLSpanElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const palettesRef = useRef(buildParticlePalettes(CHART_INDIGO_FALLBACK));
  const animationFrameRef = useRef<number | undefined>(undefined);
  const emitIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const glStateRef = useRef<GlState | null>(null);
  const isHoveringRef = useRef(false);
  const isActiveRef = useRef(false);

  const refreshPalettes = useCallback(() => {
    const probe = colorProbeRef.current;
    if (!probe) {
      return;
    }

    palettesRef.current = buildParticlePalettes(
      readChartPrimaryRgbFromProbe(probe)
    );
  }, []);

  const getColors = useCallback((bright = false) => {
    return bright ? palettesRef.current.bright : palettesRef.current.normal;
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

    const positionBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    if (!(positionBuffer && sizeBuffer && colorBuffer)) {
      return false;
    }

    glStateRef.current = {
      positionBuffer,
      sizeBuffer,
      colorBuffer,
      resolutionLocation: gl.getUniformLocation(program, "u_resolution"),
      positionLocation: gl.getAttribLocation(program, "a_position"),
      sizeLocation: gl.getAttribLocation(program, "a_size"),
      colorLocation: gl.getAttribLocation(program, "a_color"),
    };

    return true;
  }, []);

  const createParticle = useCallback(
    (x: number, y: number, bright = false): Particle => {
      const colors = getColors(bright);
      const color = colors[Math.floor(Math.random() * colors.length)] ?? {
        ...CHART_INDIGO_FALLBACK,
      };
      const angle = Math.random() * Math.PI * 2;
      const speed = bright
        ? 0.45 + Math.random() * 1.1
        : 0.2 + Math.random() * 1;
      const maxLife = bright
        ? 55 + Math.random() * 45
        : 70 + Math.random() * 80;

      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (bright ? 0.45 : 0.2),
        life: maxLife,
        maxLife,
        size: bright ? 1.5 + Math.random() * 3.5 : 1 + Math.random() * 3,
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
      const particleCount = aggressive ? 3 : 2;

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
    if (!isActiveRef.current) {
      return;
    }

    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    const glState = glStateRef.current;

    if (!(gl && program && canvas && glState)) {
      animationFrameRef.current = requestAnimationFrame(render);
      return;
    }

    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API, not a React hook
    gl.useProgram(program);

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

      gl.uniform2f(glState.resolutionLocation, canvas.width, canvas.height);

      gl.bindBuffer(gl.ARRAY_BUFFER, glState.positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.DYNAMIC_DRAW
      );
      gl.enableVertexAttribArray(glState.positionLocation);
      gl.vertexAttribPointer(
        glState.positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.bindBuffer(gl.ARRAY_BUFFER, glState.sizeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(glState.sizeLocation);
      gl.vertexAttribPointer(glState.sizeLocation, 1, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, glState.colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(glState.colorLocation);
      gl.vertexAttribPointer(glState.colorLocation, 4, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.POINTS, 0, particlesRef.current.length);
    }

    animationFrameRef.current = requestAnimationFrame(render);
  }, []);

  const stopLoop = useCallback(() => {
    isActiveRef.current = false;
    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    if (emitIntervalRef.current !== undefined) {
      clearInterval(emitIntervalRef.current);
      emitIntervalRef.current = undefined;
    }
    particlesRef.current = [];
  }, []);

  const startLoop = useCallback(() => {
    if (isActiveRef.current) {
      return;
    }

    isActiveRef.current = true;
    animationFrameRef.current = requestAnimationFrame(render);
  }, [render]);

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

    return () => {
      resizeObserver.disconnect();
      stopLoop();
    };
  }, [initWebGL, stopLoop]);

  useEffect(() => {
    if (reducedMotion || paused) {
      stopLoop();
      return;
    }

    startLoop();

    let tick = 0;
    emitIntervalRef.current = setInterval(() => {
      if (!isActiveRef.current) {
        return;
      }

      const aggressive = !disableHover && isHoveringRef.current;
      tick++;

      if (aggressive) {
        if (tick % 2 === 0) {
          emitFromEdges(true);
        }
      } else if (tick % 2 === 0) {
        emitFromEdges(false);
      }
    }, 30);

    return () => {
      stopLoop();
    };
  }, [disableHover, emitFromEdges, paused, reducedMotion, startLoop, stopLoop]);

  useEffect(() => {
    refreshPalettes();

    const observer = new MutationObserver(refreshPalettes);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [refreshPalettes]);

  const handlePointerEnter = useCallback(() => {
    if (disableHover) {
      return;
    }

    isHoveringRef.current = true;

    for (let index = 0; index < 1; index++) {
      emitFromEdges(true);
    }
  }, [disableHover, emitFromEdges]);

  const handlePointerLeave = useCallback(() => {
    if (disableHover) {
      return;
    }

    isHoveringRef.current = false;
  }, [disableHover]);

  return (
    <div
      {...props}
      className={cn(
        "relative isolate inline-flex items-center justify-center",
        className
      )}
      onPointerEnter={disableHover ? undefined : handlePointerEnter}
      onPointerLeave={disableHover ? undefined : handlePointerLeave}
    >
      <span
        aria-hidden
        className="sr-only"
        ref={colorProbeRef}
        style={{ color: "var(--chart-line-primary)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        ref={containerRef}
        style={{
          width: `calc(100% + ${bleed * 2}px)`,
          height: `calc(100% + ${bleed * 2}px)`,
        }}
      >
        <canvas
          className="pointer-events-none absolute inset-0"
          ref={canvasRef}
        />
      </div>
      <div className="relative z-10 inline-flex items-center" ref={targetRef}>
        {children}
      </div>
    </div>
  );
}
