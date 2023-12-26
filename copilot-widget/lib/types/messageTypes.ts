// original shape
export type BotResponse = {
  id: string | number;
  timestamp: number;
  from: "bot";
  type: "text";
  response: {
    text: string;
  };
}
export type UserMessage = {
  id: string | number;
  timestamp: number;
  from: "user";
  content: string;
}

export type Message = BotResponse | UserMessage;
