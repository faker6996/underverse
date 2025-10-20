import { defineConfig } from "tsup";
import path from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  tsconfig: "./tsconfig.tsup.json",
  alias: {
    "@": path.resolve(__dirname, "../../"),
  },
  external: [
    "react",
    "react-dom",
    "next",
    "next-intl",
    "lucide-react"
  ],
  esbuildOptions(options) {
    options.jsx = "automatic";
    options.jsxImportSource = "react";
  },
});
