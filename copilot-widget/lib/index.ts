export { BotMessageWrapper } from "./components/Messages";
export { default as Root } from "./Root";
export { CopilotWidget } from "./CopilotWidget";
export type {
  ComponentType,
  ComponentProps,
} from "./contexts/componentRegistery";
export type { Options } from "./types/options";
export {
  useChatState,
  useChatLoading,
  useSendMessage,
} from "./contexts/statefulMessageHandler";
export { useConfigData } from "./contexts/ConfigData";
export { useWidgetState } from "./contexts/WidgetState";
export { useSocket } from "./contexts/SocketProvider";
export { useLang } from "./contexts/LocalesProvider";
export type {
  UserMessageType,
  BotMessageType,
  HandoffPayloadType,
} from "./contexts/messageHandler";
