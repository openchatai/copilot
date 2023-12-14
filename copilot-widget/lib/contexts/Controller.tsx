import React, { ReactNode, createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import now from "../utils/timenow";
import { useAxiosInstance } from "./axiosInstance";
import { useConfigData } from "./ConfigData";
import { useSoundEffectes } from "../hooks/useSoundEffects";
import { Message } from "@lib/types";
import { getId } from "@lib/utils/utils";
import { useInitialData } from "./InitialDataContext";
import io from 'socket.io-client';
import { historyToMessages } from "@lib/utils/historyToMessages";
import { useSessionId } from "@lib/hooks/useSessionId";
export type FailedMessage = {
  message: Message;
  reason?: string;
};
interface ChatContextProps {
  messages: Message[];
  sendMessage: (message: Message) => void;
  loading: boolean;
  failedMessage: FailedMessage | null;
  reset: () => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);
const socket = io('http://localhost:8888');

const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: idata } = useInitialData();
  const [messages, setMessages] = useState<Message[]>([]);
  const sfx = useSoundEffectes();
  const [loading, setLoading] = useState(false);
  const [failedMessage, setError] = useState<FailedMessage | null>(null);
  const config = useConfigData();

  const {sessionId} = useSessionId(config?.token!)

  socket.connect().on("error", (err) => {
    console.log("Error", err)
  })

  useLayoutEffect(() => {
    if (idata?.history) {
      setMessages(historyToMessages(idata?.history));
    }
  }, [idata?.history]);
  

  useEffect(() => {
    socket.on(`${sessionId}_info`, (msg: string) => {
      console.log({log_msg: msg})
    })
  
    return () => {
      socket.off(`${sessionId}_info`);
    };
  }, [sessionId, setMessages]);

  useEffect(() => {
    socket.on(sessionId, (msg: string) => {
      console.log({bot_message: msg})
    });
  
    return () => {
      socket.off(sessionId);
    };
  }, [sessionId]);
  

  const addMessage = (message: Message) => {
    if (message.from === 'user') {
      sfx?.submit.play();
    } else {
      sfx?.notify?.play();
    }

    const messageWithTimestamp: Message = {
      ...message,
      timestamp: message.timestamp ? message.timestamp : now(),
    };

    setMessages((prevMessages) => [...prevMessages, messageWithTimestamp]);
  };

  const sendMessage = (message: Message) => {
    // send user message
    if (message.from === 'user') {
      addMessage(message);
    }

    setError(null);
    setLoading(true);

    // Emit the message to the "send_chat" event
    socket.emit('send_chat', {
      "from": "user",
      "content": (message as any).content,
      "id": getId(),
      "headers": {
        "X-Copilot": "copilot"
      },
      "token": "PMyJMFjmoKNFkus2", // auth token etc...
      "session_id": sessionId
    });

    setLoading(false);
  };

  function reset() {
    setMessages([]);
  }

  const chatContextValue: ChatContextProps = {
    messages,
    sendMessage,
    loading,
    failedMessage,
    reset,
  };

  return <ChatContext.Provider value={chatContextValue}>{children}</ChatContext.Provider>;
};

// custom react hook to access the context from child components
const useChat = (): ChatContextProps => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export { ChatProvider, useChat };
