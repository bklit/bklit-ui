import type { SunburstNode } from "@bklitui/ui/charts";

export const sunburstDemoData: SunburstNode = {
  name: "Revenue",
  children: [
    {
      name: "Product",
      children: [
        {
          name: "Enterprise",
          children: [
            {
              name: "North America",
              children: [
                { name: "Direct", value: 52 },
                { name: "Channel", value: 38 },
              ],
            },
            { name: "EMEA", value: 60 },
            { name: "APAC", value: 48 },
          ],
        },
        {
          name: "Pro",
          children: [
            { name: "Teams", value: 90 },
            { name: "Solo", value: 55 },
          ],
        },
        { name: "Starter", value: 95 },
      ],
    },
    {
      name: "Services",
      children: [
        {
          name: "Consulting",
          children: [
            { name: "Strategy", value: 72 },
            { name: "Implementation", value: 88 },
          ],
        },
        {
          name: "Support",
          children: [
            { name: "Premium", value: 48 },
            { name: "Standard", value: 42 },
          ],
        },
        { name: "Training", value: 55 },
      ],
    },
    {
      name: "Partners",
      children: [
        { name: "Referrals", value: 120 },
        { name: "Affiliates", value: 75 },
        {
          name: "Resellers",
          children: [
            { name: "Regional", value: 64 },
            { name: "Global", value: 46 },
          ],
        },
      ],
    },
    {
      name: "Other",
      children: [
        { name: "Licensing", value: 85 },
        { name: "Events", value: 42 },
      ],
    },
  ],
};
