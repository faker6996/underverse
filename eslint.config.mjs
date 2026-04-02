import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: ["packages/underverse/dist/**"],
  },
  {
    files: ["packages/underverse/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["packages/underverse/src/components/UEditor/resizable-image.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
