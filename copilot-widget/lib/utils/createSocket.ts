import { Socket, io } from "socket.io-client";

interface ConfigType {
  socketUrl: string;
  token: string;
  sessionId: string;
}

let socket: Socket | null = null;

export function createSocketClient({
  socketUrl,
  token,
  sessionId,
}: ConfigType) {
  if (socket) {
    return socket;
  }
  socket = io(socketUrl, {
    autoConnect: false,
    transports: ["websocket"],
    extraHeaders: {
      "X-Bot-Token": token,
      "X-Session-Id": sessionId,
    },
  });
  return socket;
}
