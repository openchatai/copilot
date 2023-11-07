import axios from "axios";
const instance = axios.create({
  baseURL: "http://localhost:8888/backend",
});
export type ConversationType = {
  id: string;
  chatbot_id: string;
  session_id: string;
  message: string;
  from_user: boolean;
  created_at: string;
};

export async function getConversationBySessionId(sessionId: string) {
  if (!sessionId) return;
  return await instance.get<ConversationType[]>(`/chat/session/${sessionId}/chats`);
}
