import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      ".next/",
      ".open-next/",
      ".claude/",
      ".vercel/",
      "node_modules/",
    ],
  },
  ...nextCoreWebVitals,
];

export default eslintConfig;
