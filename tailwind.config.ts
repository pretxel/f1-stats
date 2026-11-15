import type { Config } from "tailwindcss";

// Contrast (WCAG): ink on concrete 9.69, ink on slab 11.58,
// ink-soft on concrete 5.29, ink-soft on slab 6.32.
// Flag colors are fills only, always outlined in ink and labelled with text
// (yellow 1.21 and sc 1.9 against concrete would fail as standalone graphics).
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        concrete: "#DADDD8",
        slab: "#EEF0EC",
        ink: "#12324A",
        "ink-soft": "#46596A",
        rule: "#B9BEB7",
        flag: {
          green: "#1F8A4C",
          yellow: "#F2C40F",
          red: "#D7261E",
          blue: "#1D6FD1",
          sc: "#E8892B",
        },
      },
      fontFamily: {
        sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
      fontSize: {
        label: ["0.8125rem", { lineHeight: "1.25rem" }],
      },
      maxWidth: {
        page: "72rem",
      },
    },
  },
  plugins: [],
};
export default config;
