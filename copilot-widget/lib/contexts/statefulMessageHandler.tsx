/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { ChatController } from "./messageHandler";
import { createSafeContext } from "./createSafeContext";
import { useSessionId } from "@lib/hooks/useSessionId";
import { useConfigData } from "./ConfigData";
import { useSocket } from "./SocketProvider";
import { ComponentRegistery } from "./componentRegistery";

const [useMessageHandler, MessageHandlerSafeProvider] = createSafeContext<{
  __handler: ChatController;
  __components: ComponentRegistery;
}>();

function MessageHandlerProvider(props: { children: React.ReactNode }) {
  const { token, components, onHandoff } = useConfigData();
  const { sessionId } = useSessionId(token);
  const { __socket } = useSocket();

  const __components = useMemo(
    () => new ComponentRegistery({ components }),
    [components]
  );

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

  useEffect(() => {
    return handler.socketUiHandler(__socket);
  }, [__socket, handler]);

  useEffect(() => {
    return handler.socketHandoffHandler(__socket, onHandoff);
  }, [__socket, handler, onHandoff]);

  return (
    <MessageHandlerSafeProvider
      value={{
        __handler: handler,
        __components,
      }}
      {...props}
    />
  );
}

function useChatState() {
  const { __handler } = useMessageHandler();
  return useSyncExternalStore(__handler.subscribe, __handler.getSnapshot);
}

function useChatLoading() {
  const { __handler } = useMessageHandler();
  return useSyncExternalStore(__handler.subscribe, __handler.isLoading);
}

function useSendMessage() {
  const { __handler } = useMessageHandler();
  const { headers, token, queryParams } = useConfigData();
  const socket = useSocket();

  function send(content: string) {
    __handler.handleTextMessage(
      {
        headers: headers ?? {},
        query_params: queryParams ?? {},
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

export {
  useMessageHandler,
  MessageHandlerProvider,
  useChatState,
  useSendMessage,
  useChatLoading,
};
