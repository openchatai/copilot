import { Socket } from "socket.io-client";
import { createSafeContext } from "./create-safe-context";
import { ReactNode, useMemo } from "react";
import { createSocketClient } from "@lib/utils/createSocket";
import { useConfigData } from "./ConfigData";
import { useSessionId } from "@lib/hooks/useSessionId";

type SocketContextData = {
  __socket: Socket;
};
const [useSocket, SocketSafeProvider] = createSafeContext<SocketContextData>();

function SocketProvider({ children }: { children: ReactNode }) {
  const options = useConfigData();
  const { sessionId } = useSessionId(options.token);
  const socket = useMemo(
    () =>
      createSocketClient({
        socketUrl: options.socketUrl,
        token: options.token,
        sessionId,
      }),
    [options, sessionId]
  );
  return (
    <SocketSafeProvider value={{ __socket: socket }}>
      {children}
    </SocketSafeProvider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { useSocket, SocketProvider };
