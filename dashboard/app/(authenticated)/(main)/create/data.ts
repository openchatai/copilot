export const cards = [
  {
    type: "copilot",
    title: "Copilot",
    description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    type: "search",
    title: "Search",
    description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    type: "chat",
    title: "Chat",
    description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
] as const;

export type CardTypes = (typeof cards)[number]["type"];

export type Card = (typeof cards)[number];
