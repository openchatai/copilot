import { Chat } from "./chat";
import { Message } from "./messages";
import { Singleton } from "./singleton";

export class Massenger extends Singleton {
    // responsible for sending,storing messages
    private messages: Set<Message> = new Set();
    chat: Chat;
    constructor(chat: Chat) {
        super()
        this.chat = chat;
    }
    addMessage(message: Message) {
        this.messages.add(message)
    }
    getMessages() {
        return this.messages;
    }
    clearMessages() {
        this.messages.clear();
    }

}
