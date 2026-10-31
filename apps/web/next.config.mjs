import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@bklitui/ui", "@bklitui/studio", "geist"],
  serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/og/studio": ["./lib/og-fonts/**"],
  },
  experimental: {
    // Keeps dev/prod from pulling the entire charts package per MDX page.
    optimizePackageImports: ["@bklitui/ui", "@bklitui/ui/charts"],
    viewTransition: true,
  },
  async headers() {
    // Internal OG render surfaces: never index or follow (also disallowed in
    // app/robots.ts and marked noindex in their metadata).
    const noIndexHeaders = [
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ];
    return [
      { source: "/og/:path*", headers: noIndexHeaders },
      { source: "/studio/og-preview", headers: noIndexHeaders },
      { source: "/charts/og-preview", headers: noIndexHeaders },
      // Hidden dev labs (e.g. /lab/regression); 404 on the production deploy.
      { source: "/lab/:path*", headers: noIndexHeaders },
      {
        source: "/studio/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
      {
        source: "/studio/demo",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
};

export default withMDX(nextConfig);
