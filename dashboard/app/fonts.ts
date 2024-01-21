import { Cairo, Open_Sans } from "next/font/google";

export const cairoFont = Cairo({
    subsets: ["arabic"],
    weight: ["400", "500", "600", "700", "800"],
    variable: '--cairo-font',
    adjustFontFallback: false,
    display: "fallback",
})
export const opensansFont = Open_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: '--opensans-font',
    fallback: ["var(--cairo-font)"],
    adjustFontFallback: false,
    display: "fallback",
});
