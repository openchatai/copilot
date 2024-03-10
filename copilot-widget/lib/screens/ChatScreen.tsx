import ChatHeader from "../components/ChatHeader";
import { ComponentType, useEffect, useRef } from "react";
import {
  BotMessageWrapper,
  BotTextMessage,
  UserMessage,
} from "../components/Messages";
import useScrollToPercentage from "../hooks/useScrollTo";
import ChatInputFooter from "../components/ChatInputFooter";
import { useConfigData } from "../contexts/ConfigData";
import { Map } from "../utils/map";
import {
  useChatState,
  useMessageHandler,
} from "@lib/contexts/statefulMessageHandler";
import { BotMessageType } from "@lib/contexts/messageHandler";

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
  }, [messages.length, setPos]);

  const LoadingComponent = __components.getComponent("LOADING", config.debug);

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
                const component = __components.getComponent(
                  message.type,
                  config.debug
                );
                if (!component) {
                  return null;
                }
                const Component = component as ComponentType<{
                  data: BotMessageType["data"];
                  id: string;
                }>;

                return (
                  <BotMessageWrapper id={message.id} key={index}>
                    <Component
                      {...message}
                      data={message.data ?? {}}
                      id={message.id}
                    />
                  </BotMessageWrapper>
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
