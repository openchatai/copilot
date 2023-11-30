import { useLayoutEffect, useState } from "react";

export const SESSION_ID_KEY = "@openchatai:session_id";
function gtSessionId() {
  return sessionStorage.getItem(SESSION_ID_KEY);
}
export function useSessionId() {
  const [sessionId, setSessionId] = useState<string | undefined | null>(gtSessionId);
  useLayoutEffect(() => {
    const $sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if ($sessionId) {
      setSessionId(sessionId);
    } else {
      const newSessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem(SESSION_ID_KEY, newSessionId);
      setSessionId(newSessionId);
    }
  }, []);
  return { sessionId, setSessionId };
}
