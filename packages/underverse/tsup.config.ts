import { defineConfig } from "tsup";
import path from "path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageJson = require("./package.json") as {
  peerDependencies?: Record<string, string>;
};
const peerDependencies = Object.keys(packageJson.peerDependencies ?? {});

export default defineConfig({
  entry: {
    index: "src/index.ts",
    ueditor: "src/components/UEditor/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  tsconfig: "./tsconfig.tsup.json",
  alias: {
    "@": path.resolve(__dirname, "../../"),
  },
  // Keep every peer dependency external. Deriving this list from package.json
  // prevents runtime packages such as TipTap/ProseMirror from being bundled twice
  // when a new peer is added but this build file is not updated.
  external: [...peerDependencies, "@tanstack/react-virtual"],
  esbuildOptions(options) {
    options.jsx = "automatic";
    options.jsxImportSource = "react";
  },
  // Include JSON files (locales)
  loader: {
    ".json": "json",
  },
});
