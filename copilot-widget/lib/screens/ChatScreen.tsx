import {
  BotMessage,
  ChatHeader,
  ChatInputFooter,
  InitialBotMessage,
  UserMessage,
} from "@lib/components";
import { useEffect, useRef } from "react";
import { useChatState, useScrollToPercentage } from "@lib/hooks";
import { useConfigData, useMessageHandler } from "@lib/contexts";
import { Map } from "@lib/utils/map";

export function ChatScreen() {
  const scrollElementRef = useRef(null);
  const [setPos] = useScrollToPercentage(scrollElementRef);
  const { messages } = useChatState();
  const config = useConfigData();
  const initialMessage = config?.initialMessage;
  const { __components } = useMessageHandler();

  useEffect(() => {
    setPos(0, 100);
  }, []);

  useEffect(() => {
    setPos(0, 100);
  }, [messages.length]);

  const LoadingComponent = __components.getComponent("LOADING", config.debug);

  return (
    <div className="w-full flex h-full flex-col items-start relative">
      <ChatHeader />
      <main
        ref={scrollElementRef}
        className="flex-1 w-full flex flex-col overflow-x-hidden shrink-0 relative overflow-auto scrollbar-thin scroll-smooth"
      >
        <div className="flex flex-1 w-full min-h-fit mt-auto flex-col py-2 max-h-full items-center gap-1 last:fade-in-right">
          {initialMessage && <InitialBotMessage message={initialMessage} />}

          <Map
            data={messages}
            render={(message, index) => {
              if (message.from === "bot") {
                return (
                  <BotMessage key={index} index={index} message={message} />
                );
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

          {LoadingComponent && <LoadingComponent />}
        </div>
      </main>
      <ChatInputFooter />
    </div>
  );
}
