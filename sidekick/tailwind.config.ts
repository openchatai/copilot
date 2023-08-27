/** @type {import('tailwindcss').Config} */
import { Config } from "tailwindcss";
import { white, transparent, black, rose, current } from "tailwindcss/colors";
const config: Config = {
  content: ["./src/**/*.{tsx,ts,html}", "./index.html"],
  prefix: "opencopilot-",
  theme: {
    colors: {
      primary: "var(--opencopilot-primary-clr)",
      "primary-light": "var(--opencopilot-primary-light-clr)",
      accent: "var(--opencopilot-accent-clr)",
      accent2: "var(--opencopilot-accnet-2-clr)",
      white,
      transparent,
      black,
      rose,
      current,
    },
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif", "system-ui"],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar"),
  ],
}
export default config;