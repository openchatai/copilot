import { Socket } from "socket.io-client";
import { ReactNode, useCallback, useEffect, useMemo, useReducer } from "react";
import { createSocketClient } from "@lib/utils/createSocket";
import { useConfigData } from "./ConfigData";
import { createSafeContext } from "./createSafeContext";
import { useWidgetState } from "./WidgetState";
import { produce } from "immer";
import { useAxiosInstance } from "./axiosInstance";

type SocketState = {
  state: "stale" | "connected" | "retrying" | "disconnected" | "error";
  reason: string | null;
  reconnectAttempts: number | null;
};

type SocketContextData = {
  __socket: Socket;
  state: SocketState;
};

type ActionType =
  | {
      type: "RECONNECT_ATTEMPT";
      payload: number;
    }
  | {
      type: "CONNECTED";
    }
  | {
      type: "DISCONNECTED";
      payload: string;
    };

function socketReducer(state: SocketState, action: ActionType) {
  return produce(state, (draft) => {
    switch (action.type) {
      case "RECONNECT_ATTEMPT":
        draft.state = "retrying";
        draft.reconnectAttempts = action.payload;
        break;
      case "CONNECTED":
        draft.state = "connected";
        break;
      case "DISCONNECTED":
        draft.state = "disconnected";
        draft.reason = action.payload;
        break;
    }
  });
}

const [useSocket, SocketSafeProvider] = createSafeContext<SocketContextData>();

function SocketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(socketReducer, {
    state: "stale",
    reason: null,
    reconnectAttempts: null,
  });

  const options = useConfigData();
  const { sessionId } = useAxiosInstance();
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
    dispatch({ type: "CONNECTED" });
  }, []);

  const handleDisconnect = useCallback((reason: string) => {
    dispatch({ type: "DISCONNECTED", payload: reason });
  }, []);

  const handleReconnectAttempt = useCallback((attempt: number) => {
    dispatch({ type: "RECONNECT_ATTEMPT", payload: attempt });
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
    // Fired upon a successful connection.
    socket.on("connect", handleConnect);
    // Fired upon a disconnection.
    socket.on("disconnect", handleDisconnect);
    // Fired upon an attempt to reconnect.
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
