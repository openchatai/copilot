type Timestamp = Date | number;

export type BotResponse = {
  id: string | number;
  timestamp: Timestamp;
  from: "bot";
  type: "text";
  response: {
    text: string;
  };
};
export type UserMessage = {
  id: string | number;
  timestamp: Timestamp;
  from: "user";
  content: string;
};

export type Message = BotResponse | UserMessage;
