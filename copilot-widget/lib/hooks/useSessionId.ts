import { getId } from "@lib/utils/utils";
import { useEffect, useState } from "react";

export const SESSION_ID_KEY = "@openchatai:session_id";
function gtSessionId() {
  return sessionStorage.getItem(SESSION_ID_KEY);
}
export function useSessionId() {
  const [sessionId, setSessionId] = useState<string | undefined | null>(gtSessionId);
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = getId()
      sessionStorage.setItem(SESSION_ID_KEY, newSessionId);
      setSessionId(newSessionId);
    }
  }, []);
  return { sessionId, setSessionId };
}
