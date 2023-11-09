import { createSafeContext } from "@/lib/createSafeContext";

export type Settings = {
  standalone?: boolean;
  maxFlows?: number;
};

const [SettingsProvider, useSettings] = createSafeContext<Settings>("");

export { SettingsProvider, useSettings };
