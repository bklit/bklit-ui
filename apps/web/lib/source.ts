import { loader } from "fumadocs-core/source";
import { docs } from "@/.source";

// Get the source and ensure files is called if it's a function
const mdxSource = docs.toFumadocsSource();

export const source = loader({
  baseUrl: "/docs",
  source: {
    files:
      typeof mdxSource.files === "function"
        ? mdxSource.files()
        : mdxSource.files,
  },
});
