import type { BundledTheme } from "shiki";

/**
 * Shared Shiki theme configuration for code blocks.
 * Used by both MDX (source.config.ts) and DynamicCodeBlock components.
 */
export const codeThemes: { light: BundledTheme; dark: BundledTheme } = {
  light: "github-light",
  dark: "github-dark",
};
