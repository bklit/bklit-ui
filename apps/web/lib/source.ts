import { loader } from "fumadocs-core/source";
import { docs } from "@/.source";

// Get the source - handle both function and direct array cases
const mdxSource = docs.toFumadocsSource();
const files = mdxSource.files;

export const source = loader({
  baseUrl: "/docs",
  source: {
    // biome-ignore lint/suspicious/noExplicitAny: fumadocs type inference issue
    files: typeof files === "function" ? (files as any)() : files,
  },
});
