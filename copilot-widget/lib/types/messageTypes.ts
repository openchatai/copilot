// original shape
type TS = Date | number;
export type BotResponse = {
  id: string | number;
  timestamp: TS;
  from: "bot";
  type: "text";
  response: {
    text: string;
  };
}
export type UserMessage = {
  id: string | number;
  timestamp: TS;
  from: "user";
  content: string;
}

export type Message = BotResponse | UserMessage;
