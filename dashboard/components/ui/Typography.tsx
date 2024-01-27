import { twc } from "react-twc";

const H1 = twc.h1`text-2xl font-bold text-accent-foreground`;
const H2 = twc.h2`text-2xl font-semibold text-accent-foreground`;
const H3 = twc.h3`text-lg font-bold text-accent-foreground`;
const H4 = twc.h4`text-lg font-semibold text-accent-foreground`;
const H5 = twc.h5`text-base font-medium text-accent-foreground`;
const H6 = twc.h6`text-sm font-medium text-accent-foreground`;
const Text = twc.p`text-base font-normal text-accent-foreground`;
const TextSmall = twc.p`text-sm font-normal text-accent-foreground`;
const TextLarge = twc.p`text-lg font-normal text-accent-foreground`;

export {
    H1,
    H2,
    H3,
    H4,
    H5,
    H6,
    Text,
    TextSmall,
    TextLarge,
}