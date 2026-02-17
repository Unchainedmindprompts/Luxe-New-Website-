import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#2C2C2C",
        cream: "#FAF7F2",
        linen: "#F0EBE3",
        "warm-white": "#FDFCFA",
        gold: "#C9A96E",
        "gold-dark": "#B8943D",
        "warm-gray": {
          100: "#F5F3F0",
          200: "#E8E4DE",
          300: "#D4CFC7",
          400: "#B8B2A8",
          500: "#9C9589",
          600: "#7A746A",
          700: "#5C574F",
          800: "#3E3A35",
          900: "#2C2C2C",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "var(--font-playfair)", "Georgia", "serif"],
        sans: ["'Inter'", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
  plugins: [],
};
export default config;
