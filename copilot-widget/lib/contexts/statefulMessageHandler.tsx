import { useEffect, useMemo } from "react";
import { ChatController } from "./messageHandler";
import { createSafeContext } from "./createSafeContext";
import { useConfigData } from "./ConfigData";
import { useSocket } from "./SocketProvider";
import { ComponentRegistry } from "./componentRegistry.ts";
import { useAxiosInstance } from "./axiosInstance";

const [useMessageHandler, MessageHandlerSafeProvider] = createSafeContext<{
  __handler: ChatController;
  __components: ComponentRegistry;
}>();

function MessageHandlerProvider(props: { children: React.ReactNode }) {
  const { components, onHandoff } = useConfigData();
  const { sessionId } = useAxiosInstance();
  const { __socket } = useSocket();

  const __components = useMemo(
    () => new ComponentRegistry({ components }),
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

export { useMessageHandler, MessageHandlerProvider };
