export type BotMessageType<TData = Record<string, unknown>> = {
  from: "bot";
  type: string;
  id: string;
  data: TData;
  timestamp: string;
  responseFor: string; // id of the user message
  isFailed?: boolean;
};

export type UserMessageType = {
  from: "user";
  id: string;
  content: string;
  timestamp: string;
  session_id: string;
  headers: Record<string, string>;
  bot_token: string;
  query_params: Record<string, string>;
  language?: string;
};

export type MessageType = UserMessageType | BotMessageType;

export type HandoffPayloadType = {
  summary: string;
  sentiment: "happy" | "angry" | "neutral";
}; // sometimes it will be an empty object
