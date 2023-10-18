import { useEffect, useState } from "react";

const SESSION_ID_KEY = "@openchatai:session_id";

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  useEffect(() => {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (sessionId) {
      setSessionId(sessionId);
    } else {
      const newSessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem(SESSION_ID_KEY, newSessionId);
      setSessionId(newSessionId);
    }
  }, []);
  return { sessionId, setSessionId };
}
