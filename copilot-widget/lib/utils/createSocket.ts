import { Socket, io } from "socket.io-client";

interface ConfigType {
  socketUrl: string;
  token: string;
  sessionId: string;
}

const sockets = new Map<string, Socket>();

export function createSocketClient({
  socketUrl,
  token,
  sessionId,
}: ConfigType) {
  const socket = sockets.get(sessionId + token);
  if (socket) {
    return socket;
  }
  const newSocket = io(socketUrl, {
    autoConnect: false,
    transports: ["websocket"],
    extraHeaders: {
      "X-Bot-Token": token,
      "X-Session-Id": sessionId,
    },
  });
  sockets.set(sessionId + token, newSocket);
  return newSocket;
}
