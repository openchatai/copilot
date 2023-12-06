type Actor = "user" | "bot";

export class UserMessage {
    timestamp?: number | Date;
    id: string | number;
    from: Actor = "user";
    content: string;
    constructor(content: string, id: string | number, timestamp?: number | Date) {
        this.content = content;
        this.from = "user";
        this.id = id;
        this.timestamp = timestamp || Date.now();
    }
}

export class CopilotMessage {
    timestamp?: number | Date;
    id: string | number;
    from: Actor = "bot";
    type: "text";
    response: {
        text: string;
    };
    constructor(text: string, id: string, timestamp?: number | Date) {
        this.response = { text };
        this.from = "bot";
        this.type = "text";
        this.id = id;
        this.timestamp = timestamp || Date.now();
    }
}


export type Message = CopilotMessage | UserMessage;
