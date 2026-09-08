import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palm: {
          50: "#f0f7f3",
          100: "#dceee3",
          200: "#b5dac2",
          500: "#1a7a4c",
          600: "#006c35",
          700: "#005a2c",
          800: "#004723",
          900: "#06351c",
          950: "#022011",
        },
        sand: {
          50: "#fbf8f1",
          100: "#f4ead4",
          200: "#e8d5a8",
          300: "#d9bd79",
          400: "#c9a227",
          500: "#a88419",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

