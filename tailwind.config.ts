import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // GolfNext brand colors
        "midnight-green": "#053E3F",
        lime: "#C0E66E",
        "lime-accent": "#D3FA7D",
        clay: "#CCB47F",
        "base-dark": "#303333",
        neutral: "#E9E1CF",
        "dark-text": "#555B5B",
        "error-red": "#F07860",
        "info-blue": "#60B2F0",
      },
      fontFamily: {
        sora: ["Sora", "Arial", "sans-serif"],
        manrope: ["Manrope", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
