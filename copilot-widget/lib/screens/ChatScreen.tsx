import ChatHeader from "../components/ChatHeader";
import { useEffect, useRef } from "react";
import {
  BotMessageError,
  BotMessageLoading,
  BotTextMessage,
  UserMessage,
} from "../components/Messages";
import useScrollToPercentage from "../hooks/useScrollTo";
import ChatInputFooter from "../components/ChatInputFooter";
import { ChatProvider, useChat } from "../contexts/Controller";
import { useConfigData } from "../contexts/ConfigData";
import { Map } from "../utils/Map";

function ChatScreen() {
  const scrollElementRef = useRef(null);
  const [setPos] = useScrollToPercentage(scrollElementRef);
  const { messages, loading, failedMessage, conversationInfo } = useChat();
  const config = useConfigData();
  const initialMessage = config?.initialMessage;
  useEffect(() => {
    setPos(0, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPos(0, 100);
  }, [messages, setPos]);

  return (
    <div className="opencopilot-w-full opencopilot-flex opencopilot-h-full opencopilot-flex-col opencopilot-items-start opencopilot-relative">
      <ChatHeader />
      <main
        ref={scrollElementRef}
        className="opencopilot-flex-1 opencopilot-w-full opencopilot-overflow-x-hidden opencopilot-shrink-0 opencopilot-overflow-auto opencopilot-scrollbar-thin opencopilot-scroll-smooth"
      >
        <div className="opencopilot-flex opencopilot-h-fit opencopilot-mt-auto opencopilot-flex-col opencopilot-py-2 opencopilot-max-h-full opencopilot-items-center opencopilot-gap-1 last:fade-in-right">
          {
            // If there are initial messages, show them
            initialMessage && <BotTextMessage message={initialMessage} />
          }
          <Map
            fallback={<hr />}
            data={messages}
            render={(message, index) => {
              if (message.from === "bot") {
                if (message.type === "text")
                  return (
                    <BotTextMessage
                      timestamp={message.timestamp}
                      id={message.id}
                      key={index}
                      message={message.response.text}
                    />
                  );
              } else if (message.from === "user") {
                return (
                  <UserMessage
                    key={index}
                    id={message.id}
                    timestamp={message.timestamp}
                    content={message.content}
                  />
                );
              }
            }}
          />
          {loading && conversationInfo && <BotMessageLoading displayText={conversationInfo} />}
          {failedMessage && <BotMessageError message={failedMessage} />}
        </div>
      </main>
      <ChatInputFooter />
    </div>
  );
}

export default function ChatScreenWithSfxs() {
  return (
    <ChatProvider>
      <ChatScreen />
    </ChatProvider>
  );
}
