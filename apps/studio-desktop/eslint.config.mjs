import { config } from "@bklitui/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: ["dist/**", "src-tauri/target/**", "src-tauri/gen/**"],
  },
];
