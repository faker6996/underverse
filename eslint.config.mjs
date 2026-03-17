import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: ["packages/underverse/dist/**"],
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/static-components": "off",
    },
  },
  {
    files: ["packages/underverse/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["components/ui/UEditor/resizable-image.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
