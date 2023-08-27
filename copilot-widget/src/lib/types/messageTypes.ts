// original shape
export type Message = {
    timestamp?: number;
} & (
        | { from: "user"; content: string }
        | ({ from: "bot" } & (
            | {
                type: "text";
                response: {
                    text: string;
                };
            }
        ))
    );
