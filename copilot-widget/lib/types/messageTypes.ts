// original shape
export type Message = {
  timestamp?: number;
  id: string;
} & (
  | { from: "user"; content: string }
  | ({ from: "bot" } & {
      type: "text";
      response: {
        text: string;
      };
    })
);
