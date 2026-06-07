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
  },
  async headers() {
    return [
      {
        source: "/studio/embed",
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
