// original shape
export type Message = {
  timestamp?: number | Date;
  id: string | number;
} & (
    | { from: "user"; content: string }
    | ({ from: "bot" } & {
      type: "text";
      response: {
        text: string;
      };
    })
  );
