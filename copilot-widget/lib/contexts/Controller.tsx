import React, { ReactNode, createContext, useContext, useState } from "react";
import now from "../utils/timenow";
import { useAxiosInstance } from "./axiosInstance";
import { useConfigData } from "./ConfigData";
import { useSoundEffectes } from "../hooks/useSoundEffects";
import { Message } from "@lib/types";
import { getId } from "@lib/utils/utils";
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

const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const sfx = useSoundEffectes();
  const [loading, setLoading] = useState(false);
  const [failedMessage, setError] = useState<FailedMessage | null>(null);
  const { axiosInstance } = useAxiosInstance();
  const config = useConfigData();
  const addMessage = (message: Message) => {
    if (message.from === "user") {
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
  // will be called from BotInputMessage component
  // NOTE:need some adjustments in production

  const sendMessage = async (message: Message) => {
    // send user message
    if (message.from === "user") {
      addMessage(message);
    }
    setError(null);
    setLoading(true);
    try {
      const { data, status, statusText } = await axiosInstance.post(
        "/chat/send",
        {
          ...message,
          headers: config?.headers,
        }
      );
      if (status === 200) {
        addMessage({ ...data, id: getId(), from: "bot" });
      } else {
        setError({
          message,
          reason: statusText,
        });
      }
    } catch (error: any) {
      setError({
        message,
        reason: error?.message,
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <ChatContext.Provider value={chatContextValue}>
      {children}
    </ChatContext.Provider>
  );
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
