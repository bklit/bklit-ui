"use client";

import Link from "fumadocs-core/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FooterNavLink } from "@/components/design/footer-nav-link";
import { BklitLogo } from "@/components/icons/bklit";

const chartLinks = [
  { text: "Area Chart", href: "/docs/components/area-chart" },
  { text: "Bar Chart", href: "/docs/components/bar-chart" },
  { text: "Candlestick Chart", href: "/docs/components/candlestick-chart" },
  { text: "Choropleth Chart", href: "/docs/components/choropleth-chart" },
  { text: "Composed Chart", href: "/docs/components/composed-chart" },
  { text: "Funnel Chart", href: "/docs/components/funnel-chart" },
  { text: "Gauge", href: "/docs/components/gauge-chart" },
  { text: "Heatmap Chart", href: "/docs/components/heatmap-chart" },
  { text: "Line Chart", href: "/docs/components/line-chart" },
  { text: "Profit/Loss Line", href: "/docs/components/profit-loss-line" },
  { text: "Live Line Chart", href: "/docs/components/live-line-chart" },
  { text: "Pie Chart", href: "/docs/components/pie-chart" },
  { text: "Radar Chart", href: "/docs/components/radar-chart" },
  { text: "Ring Chart", href: "/docs/components/ring-chart" },
  { text: "Scatter Chart", href: "/docs/components/scatter-chart" },
  { text: "Sankey Chart", href: "/docs/components/sankey-chart" },
] as const;

const footerColumns = [
  {
    title: "Product",
    links: [
      { text: "Docs", href: "/docs/installation" },
      { text: "Components", href: "/docs/components" },
      { text: "Blocks", href: "/blocks" },
      { text: "Studio", href: "/studio" },
    ],
  },
  {
    title: "Explore",
    links: chartLinks,
  },
  {
    title: "Community",
    links: [
      { text: "Skills", href: "/docs/skills" },
      {
        text: "GitHub",
        href: "https://github.com/bklit/bklit-ui",
        external: true,
      },
      {
        text: "Discord",
        href: "https://discord.gg/75s4frfE8X",
        external: true,
      },
    ],
  },
] as const;

export function HomeFooter() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoTheme = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <footer className="relative w-full pt-16 pb-8 md:pt-24">
      <div className="container mx-auto w-full px-4">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link
              className="inline-flex w-fit items-center gap-2.5 no-underline transition-opacity hover:opacity-80"
              href="/"
            >
              <BklitLogo size={28} theme={logoTheme} />
              <span className="font-semibold text-foreground text-lg tracking-tight">
                Bklit UI
              </span>
            </Link>
          </div>

          {footerColumns.map((column) => (
            <div className="flex flex-col gap-4" key={column.title}>
              <p className="font-medium font-mono text-muted-foreground/50 text-xs uppercase tracking-widest">
                {column.title}
              </p>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <FooterNavLink
                      external={"external" in link ? link.external : undefined}
                      href={link.href}
                      text={link.text}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
