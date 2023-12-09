import { useEffect, useState } from "react";

// the session id will be copilotId:uniqueId
function randomString(length: number = 10) {
  return Math.random().toString(36).substring(2, length + 2);
}

export function useSessionId(copilotToken: string) {
  const [sessionId, setSessionId] = useState<string>(sessionStorage.getItem(copilotToken) || randomString());
  useEffect(() => {
    sessionStorage.setItem(copilotToken, sessionId);
  }, [sessionId, copilotToken]);
  return { sessionId, setSessionId };
}
