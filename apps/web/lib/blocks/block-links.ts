import {
  openInV0Href,
  registryJsonUrlForName,
  registryV0ExampleJsonUrl,
  shadcnAddItem,
} from "@/lib/studio/chart-links";

export function blockRegistryJsonUrl(name: string) {
  return registryJsonUrlForName(name);
}

export function blockOpenInV0Href(name: string) {
  return openInV0Href(registryV0ExampleJsonUrl(name));
}

export function blockShadcnAddCommand(name: string) {
  return `npx shadcn@latest add ${shadcnAddItem(name)}`;
}
