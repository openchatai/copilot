import { produce } from "immer";
import { Socket } from "socket.io-client";

export type UserMessageType = {
  from: "user";
  id: string;
  content: string;
  timestamp: string;
  session_id: string;
  headers: Record<string, string>;
  bot_token: string;
};

export type BotMessageType = {
  from: "bot";
  id: string;
  message: string;
  timestamp: string;
  responseFor: string; // id of the user message
  isFailed?: boolean;
  isLoading?: boolean;
};
export type MessageType = UserMessageType | BotMessageType;

export type State = {
  currentUserMessage: null | UserMessageType;
  conversationInfo: null | string;
  lastServerMessageId: null | string;
  messages: MessageType[];
  clientState: Record<string, unknown>; // @for future use
  components: Record<string, unknown>; // @for future use
  submittedForms: Record<string, unknown>; // @for future use
};
type Listener<T> = (s: T) => void;

export class ChatController {
  sessionId: string | null = null;
  listeners = new Set<Listener<State>>();

  private state: State = {
    currentUserMessage: null,
    conversationInfo: null,
    lastServerMessageId: null,
    messages: [],
    clientState: {}, // @for future use
    components: {}, // @for future use
    submittedForms: {}, // @for future use
  };

  constructor(sessionId: string) {
    if (!sessionId) {
      throw new Error("sessionId is not set");
    }
    this.sessionId = sessionId;
  }

  listen = (fn: Listener<State>) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  notify = () => {
    for (const listener of this.listeners) {
      console.log("notifying");
      listener(this.state);
    }
  };

  getSnapshot = () => {
    return this.state;
  };

  reset() {
    this.imm((draft) => {
      draft.messages = [];
      draft.currentUserMessage = null;
      draft.conversationInfo = null;
      draft.lastServerMessageId = null;
    });
    this.notify();
  }

  genId = (len = 7) => {
    return Math.random().toString(36).substring(len);
  };

  getTimeStamp = () => {
    return new Date().toLocaleTimeString("en-US", {
      formatMatcher: "best fit",
      hour: "numeric",
      minute: "numeric",
    });
  };

  isLoading = () => {
    return (
      this.state.messages.find((m) => m.from === "bot" && m.isLoading) !==
      undefined
    );
  };

  protected imm(func: (draft: State) => void) {
    produce(this.state, func);
  }

  select = <KT extends keyof State>(key: KT) => {
    return this.state[key];
  };

  setConversationInfo = (info: string) => {
    this.imm((draft) => {
      draft.conversationInfo = info;
    });
  };

  settle = (idFor: string) => {
    this.imm((draft) => {
      draft.currentUserMessage = null;
      const botMessage = draft.messages.find(
        (m) => m.from === "bot" && m.responseFor === idFor
      ) as BotMessageType;
      if (botMessage) {
        botMessage.isLoading = false;
      }
    });
    this.notify();
  };

  createEmptyLoadingBotMessage = (messageFor: string) => {
    this.imm((draft) => {
      draft.messages.push({
        from: "bot",
        message: "",
        timestamp: this.getTimeStamp(),
        responseFor: messageFor,
        isLoading: true,
        id: this.genId(),
      });
    });
    this.notify();
  };

  setLastServerMessageId = (id: string | null) => {
    this.imm((draft) => {
      draft.lastServerMessageId = id;
    });
    this.notify();
  };

  handleMessage = (
    message: Omit<UserMessageType, "from" | "id" | "timestamp" | "session_id">,
    socket: Socket
  ) => {
    const sessionId = this.sessionId;
    if (!sessionId) {
      return;
    }
    this.setLastServerMessageId(null);
    const id = this.genId();
    const userMessage: UserMessageType = {
      ...message,
      from: "user",
      session_id: sessionId,
      id: id,
      timestamp: this.getTimeStamp(),
    };

    this.imm((draft) => {
      draft.messages.push(userMessage);
      draft.currentUserMessage = userMessage;
    });

    socket.emit("send_chat", userMessage);
    this.createEmptyLoadingBotMessage(userMessage.id);
    this.notify();
  };

  appendToCurrentBotMessage = (message: string) => {
    const curretUserMessage = this.state.currentUserMessage;

    if (message === "|im_end|") {
      curretUserMessage && this.settle(curretUserMessage.id);
      return;
    }

    this.imm((draft) => {
      const userMessage = draft.messages.find(
        (m) => m.from === "user" && m.id === curretUserMessage?.id
      ) as UserMessageType;

      if (userMessage) {
        const botMessage = draft.messages.find(
          (m) => m.from === "bot" && m.responseFor === userMessage.id
        ) as BotMessageType;

        if (botMessage) {
          botMessage.message += message;
        }
      }
    });
    this.notify();
  };
  // socket handlers impl.
  socketChatInfoHandler = (socket: Socket) => {
    const sessionId = this.sessionId;
    const setConversationInfo = this.setConversationInfo;
    function handler(msg: string) {
      // extra logic
      setConversationInfo(msg);
    }
    socket.on(`${sessionId}_info`, handler);
    return () => {
      socket.off(`${sessionId}_info`, handler);
    };
  };

  socketChatVoteHandler = (socket: Socket) => {
    const sessionId = this.sessionId;
    if (!sessionId) {
      return;
    }
    const setLastServerMessageId = this.setLastServerMessageId;
    function handle(msg: string) {
      setLastServerMessageId(msg);
    }

    socket.on(`${sessionId}_vote`, handle);

    return () => {
      socket.off(`${sessionId}_vote`, handle);
    };
  };

  socketMessageRespHandler = (socket: Socket) => {
    const sessionId = this.sessionId;
    if (!sessionId) {
      return;
    }
    const appendToCurrentBotMessage = this.appendToCurrentBotMessage;
    function handle(content: string) {
      appendToCurrentBotMessage(content);
    }

    socket.on(sessionId, handle);

    return () => {
      socket.off(sessionId, handle);
    };
  };
}
