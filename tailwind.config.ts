import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        f1red: "#E10600",
        "f1red-dark": "#B00400",
        carbon: "#0C0C0E",
        "carbon-light": "#141418",
        "carbon-mid": "#1C1C22",
        "carbon-border": "#2A2A32",
        chromium: "#F0F0F0",
        muted: "#8B8B9A",
        "muted-dark": "#55555F",
        gold: "#FFD700",
      },
      fontFamily: {
        display: ["var(--font-barlow)", "sans-serif"],
        data: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
