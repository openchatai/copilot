import { useEffect, useMemo, useSyncExternalStore } from "react";
import { ChatController } from "./messageHandler";
import { createSafeContext } from "./createSafeContext";
import { useSessionId } from "@lib/hooks/useSessionId";
import { useConfigData } from "./ConfigData";
import { useSocket } from "./SocketProvider";

const [useMessageHandler, MessageHandlerSafeProvider] = createSafeContext<{
  __handler: ChatController;
}>();

function MessageHandlerProvider(props: { children: React.ReactNode }) {
  const { token } = useConfigData();
  const { sessionId } = useSessionId(token);
  const { __socket } = useSocket();

  const handler = useMemo(() => new ChatController(sessionId), [sessionId]);

  useEffect(() => {
    return handler.socketChatInfoHandler(__socket);
  }, [__socket, handler]);

  useEffect(() => {
    return handler.socketChatVoteHandler(__socket);
  }, [__socket, handler]);

  useEffect(() => {
    return handler.socketMessageRespHandler(__socket);
  }, [__socket, handler]);

  return (
    <MessageHandlerSafeProvider
      value={{
        __handler: handler,
      }}
      {...props}
    />
  );
}

function useChatState() {
  const { __handler } = useMessageHandler();
  return useSyncExternalStore(__handler.subscribe, __handler.getSnapshot);
}

function useSendMessage() {
  const { __handler } = useMessageHandler();
  const { headers, token } = useConfigData();
  const socket = useSocket();

  function send(content: string) {
    __handler.handleTextMessage(
      {
        headers: headers ?? {},
        content,
        bot_token: token,
      },
      socket.__socket
    );
  }

  return {
    send,
  };
}
// eslint-disable-next-line react-refresh/only-export-components
export {
  useMessageHandler,
  MessageHandlerProvider,
  useChatState,
  useSendMessage,
};
