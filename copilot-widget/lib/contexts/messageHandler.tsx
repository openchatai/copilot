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
  type: string;
  id: string;
  props?: Record<string, unknown>;
  timestamp: string;
  responseFor: string; // id of the user message
  isFailed?: boolean;
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
  // sometimes the im_end message is not received from the bot, so we have to set a timeout to end the current message
  // this is the timeout id
  private timeoutId: NodeJS.Timeout | null = null;
  private timeoutDuration = 10000; // 10 seconds
  listeners = new Set<Listener>();
  components: ComponentRegistery | undefined;

  private state: State = {
    currentUserMessage: null,
    conversationInfo: null,
    lastServerMessageId: null,
    messages: [],
    clientState: {},
  };

  constructor(sessionId: string, components?: ComponentRegistery) {
    if (!sessionId) {
      throw new Error("sessionId is not set");
    }
    this.sessionId = sessionId;
    this.components = components;
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
    return this.state.currentUserMessage !== null;
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

  settle = () => {
    this.setValueImmer((draft) => {
      draft.currentUserMessage = null;
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
    if (!sessionId) return;

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
  };

  // Called for every character recived from the bot
  appendToCurrentBotMessage = (message: string) => {
    const currentUserMessage = this.state.currentUserMessage;

    if (!currentUserMessage) {
      return;
    }

    // Append the message content to the existing botmessage.type=TEXT or create a new one
    const botMessage = this.select("messages").find(
      (msg) => msg.id === currentUserMessage.id
    ) as BotMessageType;
    if (botMessage) {
      this.setValueImmer((draft) => {
        const d = draft.messages.find(
          (msg) =>
            msg.id === currentUserMessage.id &&
            msg.from === "bot" &&
            msg.type === "TEXT"
        ) as BotMessageType;
        if (d) {
          d.props = {
            message: (d.props?.message || "") + message,
          };
        } else {
          draft.messages.push({
            from: "bot",
            id: currentUserMessage.id,
            type: "TEXT",
            responseFor: currentUserMessage.id,
            timestamp: this.getTimeStamp(),
            props: {
              message: message,
            },
          });
        }
      });
    } else {
      this.setValueImmer((draft) => {
        draft.messages.push({
          from: "bot",
          id: currentUserMessage.id,
          type: "TEXT",
          responseFor: currentUserMessage.id,
          timestamp: this.getTimeStamp(),
          props: {
            content: message,
          },
        });
      });
    }
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
    const settle = this.settle;
    const handle = (content: string) => {
      if (content === "|im_end|") {
        settle();
        return;
      }
      
      this.startTimeout(() => {
        settle();
      });

      this.appendToCurrentBotMessage(content);
    };

    socket.on(sessionId, handle);

    return () => {
      socket.off(sessionId, handle);
    };
  };

  socketVisualizeHandler = (socket: Socket) => {
    const sessionId = this.sessionId;
    if (!sessionId) {
      return;
    }
    function handle(msg: string) {
      //
    }

    socket.on(`${sessionId}_vote`, handle);

    return () => {
      socket.off(`${sessionId}_vote`, handle);
    };
  };

  private startTimeout = (callback: () => void) => {
    this.timeoutId = setTimeout(() => {
      callback();
      this.timeoutId = null;
    }, this.timeoutDuration);
  };

  private clearTimeout = () => {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  };
}
