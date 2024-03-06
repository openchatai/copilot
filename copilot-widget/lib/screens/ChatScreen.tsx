import ChatHeader from "../components/ChatHeader";
import { useEffect, useRef } from "react";
import { BotTextMessage, UserMessage } from "../components/Messages";
import useScrollToPercentage from "../hooks/useScrollTo";
import ChatInputFooter from "../components/ChatInputFooter";
import { useConfigData } from "../contexts/ConfigData";
import { Map } from "../utils/map";
import {
  useChatState,
  useMessageHandler,
} from "@lib/contexts/statefulMessageHandler";

export default function ChatScreen() {
  const scrollElementRef = useRef(null);
  const [setPos] = useScrollToPercentage(scrollElementRef);
  const { messages } = useChatState();
  const config = useConfigData();
  const initialMessage = config?.initialMessage;
  const { __components } = useMessageHandler();
  useEffect(() => {
    setPos(0, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPos(0, 100);
  }, [messages, setPos]);

  return (
    <div className="w-full flex h-full flex-col items-start relative">
      <ChatHeader />
      <main
        ref={scrollElementRef}
        className="flex-1 w-full overflow-x-hidden shrink-0 overflow-auto scrollbar-thin scroll-smooth"
      >
        <div className="flex h-fit mt-auto flex-col py-2 max-h-full items-center gap-1 last:fade-in-right">
          {
            // If there are initial messages, show them
            initialMessage && <BotTextMessage message={initialMessage} />
          }
          <Map
            data={messages}
            render={(message, index) => {
              if (message.from === "bot") {
                const Component = __components.getOrFallback(
                  message.type
                )?.component;
                return <Component {...message.props} />;
              } else if (message.from === "user") {
                return (
                  <UserMessage
                    key={index}
                    id={message.id}
                    content={message.content}
                  />
                );
              }
            }}
          />
        </div>
      </main>
      <ChatInputFooter />
    </div>
  );
}
