import { produce } from "immer";
import { Socket } from "socket.io-client";
import { ComponentRegistery } from "./componentRegistery";

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

export type ComponentType<DT> = {
  key: string;
  data?: DT;
};

export type State = {
  currentUserMessage: null | UserMessageType;
  conversationInfo: null | string;
  lastServerMessageId: null | string;
  messages: MessageType[];
  clientState: Record<string, unknown>; // @for future use
};

type Listener<T = State> = (value: T) => void;
type UpdaterFunction<T = State> = (oldValue: T) => T;
export class ChatController {
  sessionId: string | null = null;
  listeners = new Set<Listener>();
  components = new ComponentRegistery({});

  private state: State = {
    currentUserMessage: null,
    conversationInfo: null,
    lastServerMessageId: null,
    messages: [],
    clientState: {},
  };

  constructor(sessionId: string) {
    if (!sessionId) {
      throw new Error("sessionId is not set");
    }
    this.sessionId = sessionId;
  }

  notify = () => {
    this.listeners.forEach((l) => l(this.state));
  };

  unSubscribe = (listener: Listener) => {
    this.listeners.delete(listener);
  };

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.unSubscribe(listener);
    };
  };

  getSnapshot = () => {
    return this.state;
  };

  reset() {
    this.setValueImmer((draft) => {
      draft.messages = [];
      draft.currentUserMessage = null;
      draft.conversationInfo = null;
      draft.lastServerMessageId = null;
    });
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

  setValue = (newValue: State | UpdaterFunction) => {
    if (typeof newValue === "function") {
      this.state = (newValue as UpdaterFunction)(this.state);
    } else {
      this.state = newValue;
    }
    this.notify();
  };

  setValueImmer = (updater: (draft: State) => void) => {
    this.setValue(produce(this.state, updater));
  };

  select = <KT extends keyof State>(key: KT) => {
    return this.state[key];
  };

  setConversationInfo = (info: string) => {
    this.setValueImmer((draft) => {
      draft.conversationInfo = info;
    });
  };

  settle = (idFor: string) => {
    this.setValueImmer((draft) => {
      draft.currentUserMessage = null;
      const botMessage = draft.messages.find(
        (m) => m.from === "bot" && m.responseFor === idFor
      ) as BotMessageType;
      if (botMessage) {
        botMessage.isLoading = false;
      }
    });
  };

  createEmptyLoadingBotMessage = (messageFor: string) => {
    this.setValueImmer((draft) => {
      draft.messages.push({
        from: "bot",
        message: "",
        timestamp: this.getTimeStamp(),
        responseFor: messageFor,
        isLoading: true,
        id: this.genId(),
      });
    });
  };

  setLastServerMessageId = (id: string | null) => {
    this.setValueImmer((draft) => {
      draft.lastServerMessageId = id;
    });
  };

  handleTextMessage = (
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

    this.setValueImmer((draft) => {
      draft.messages.push(userMessage);
      draft.currentUserMessage = userMessage;
    });

    socket.emit("send_chat", userMessage);
    this.createEmptyLoadingBotMessage(userMessage.id);
  };

  appendToCurrentBotMessage = (message: string) => {
    const curretUserMessage = this.state.currentUserMessage;

    if (message === "|im_end|") {
      curretUserMessage && this.settle(curretUserMessage.id);
      return;
    }

    this.setValueImmer((draft) => {
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
