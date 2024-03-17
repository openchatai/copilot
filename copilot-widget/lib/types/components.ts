import type { BotMessageType } from "./messageTypes";

export type ComponentProps<TData> = BotMessageType<TData>;

export type ComponentType = {
  key: string;
  component: React.ElementType;
};

export type OptionsType = {
  components?: ComponentType[];
};
