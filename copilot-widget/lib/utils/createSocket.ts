import { io } from "socket.io-client";

interface ConfigType {
  socketUrl: string;
  token: string;
  sessionId: string;
}

export function createSocketClient({
  socketUrl,
  token,
  sessionId,
}: ConfigType) {
  return io(socketUrl, {
    autoConnect: false,
    transports: ["websocket"],
    extraHeaders: {
      "X-Bot-Token": token,
      "X-Session-Id": sessionId,
    },
  });
}
