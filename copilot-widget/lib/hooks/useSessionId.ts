import { useRef } from "react";

// the session id will be copilotId:uniqueId
function randomString(length = 10) {
  return Math.random().toString(36).substring(2, length + 2);
}

export function useSessionId(copilotToken: string) {
  const sessionId = useRef<string>(copilotToken + "|" + randomString()).current;
  const setSessionId = (copilotToken: string) => {
    // copilotToken
  }
  return { sessionId, setSessionId };
}
