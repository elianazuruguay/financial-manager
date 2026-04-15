import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-sm": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "600" }],
        display: ["2.5rem", { lineHeight: "1.12", letterSpacing: "-0.025em", fontWeight: "600" }],
      },
      boxShadow: {
        glass: "0 4px 36px -8px rgba(0,0,0,0.55), 0 18px 56px -24px rgba(0,0,0,0.45)",
        "glass-sm": "0 2px 20px -6px rgba(0,0,0,0.42)",
        "inner-soft": "inset 0 2px 8px rgba(0,0,0,0.2)",
      },
      colors: {
        surface: {
          deep: "#060608",
          base: "#09090b",
          raised: "#0f0f12",
        },
      },
    },
  },
  plugins: [],
};

export default config;
