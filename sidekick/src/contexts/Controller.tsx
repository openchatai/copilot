import React, { ReactNode, createContext, useContext, useState } from "react";
import { type Message } from "../lib/types";
import now from "../utils/timenow";
import { useAxiosInstance } from "./axiosInstance";
import { useConfigData } from "./ConfigData";
import { useSoundEffectes } from "../hooks/useSoundEffects";

interface ChatContextProps {
  messages: Message[];
  sendMessage: (message: Message) => void;
  loading: boolean;
  error: boolean;
  reset: () => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const sfx = useSoundEffectes();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
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
    setError(false);
    addMessage(message);

    try {
      // Make the API call to send the message
      // we want to set loading for the bot message to be sent.
      setLoading(true);
      const response = await axiosInstance.post<
        Extract<Message, { from: "bot" }>
      >("/chat/send", { ...message, headers: config?.headers });
      addMessage({ ...response.data, from: "bot" });
    } catch (error) {
      console.error("Error sending the message:");
      setError(true);
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
    error,
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
