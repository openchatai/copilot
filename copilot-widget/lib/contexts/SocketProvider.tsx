import { Socket } from "socket.io-client";
import { ReactNode, useCallback, useEffect, useMemo, useReducer } from "react";
import { createSocketClient } from "@lib/utils/createSocket";
import { useConfigData } from "./ConfigData";
import { useSessionId } from "@lib/hooks/useSessionId";
import { createSafeContext } from "./createSafeContext";
import { useWidgetState } from "./WidgetState";
import { produce } from "immer";

type SocketState = {
  state: "connected" | "disconnected" | "retrying" | "stale";
  reconnectAttempts: number;
};

type SocketContextData = {
  __socket: Socket;
  state: SocketState;
};

function socketReducer(
  state: SocketState,
  action:
    | { type: "SET_STATE"; payload: SocketState["state"] }
    | { type: "SET_ATTEMPTS"; payload: number }
) {
  return produce(state, (draft) => {
    switch (action.type) {
      case "SET_STATE": {
        draft.state = action.payload;
        break;
      }
      case "SET_ATTEMPTS": {
        draft.reconnectAttempts = action.payload;
        break;
      }
    }
  });
}

const [useSocket, SocketSafeProvider] = createSafeContext<SocketContextData>();

function SocketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(socketReducer, {
    state: "stale",
    reconnectAttempts: 0,
  });

  const options = useConfigData();
  const { sessionId } = useSessionId(options.token);
  const [open] = useWidgetState();
  const socket = useMemo(
    () =>
      createSocketClient({
        socketUrl: options.socketUrl,
        token: options.token,
        sessionId,
      }),
    [options, sessionId]
  );

  const handleConnect = useCallback(() => {
    dispatch({ type: "SET_STATE", payload: "connected" });
  }, []);

  const handleDisconnect = useCallback(() => {
    dispatch({ type: "SET_STATE", payload: "disconnected" });
  }, []);

  const handleReconnectAttempt = useCallback((attempt: number) => {
    dispatch({ type: "SET_STATE", payload: "retrying" });
    dispatch({ type: "SET_ATTEMPTS", payload: attempt });
  }, []);

  useEffect(() => {
    if (open) {
      socket.connect();
    } else {
      socket.disconnect();
    }
    return () => {
      socket.disconnect();
    };
  }, [open, socket]);

  useEffect(() => {
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("reconnect_attempt", handleReconnectAttempt);
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnect_attempt", handleReconnectAttempt);
    };
  }, [socket, handleConnect, handleDisconnect, handleReconnectAttempt]);

  return (
    <SocketSafeProvider value={{ __socket: socket, state }}>
      {children}
    </SocketSafeProvider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { useSocket, SocketProvider };
