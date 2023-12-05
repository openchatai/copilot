import axios from "axios";
import { baseUrl } from "./base-url";
const instance = axios.create({
  baseURL: baseUrl + "/backend/chat",
});
export type ChatMessageType = {
  id: string;
  chatbot_id: string;
  session_id: string;
  message: string;
  from_user: boolean;
  created_at: string;
};

// http://localhost:8888/backend/chat/sessions/:sessionId/chats
export async function getConversationBySessionId(sessionId: string) {
  if (!sessionId) return;
  return (await instance.get<ChatMessageType[]>(`/sessions/${sessionId}/chats`)).data;
}

export type ConversationType = {
  first_message: {
    id: number;
    chatbot_id: string;
    created_at: string;
    from_user: boolean;
    message: string;
    session_id: string;
    updated_at: string;
  };
  session_id: string;
}

// http://localhost:8888/backend/chat/b/:bot_id/chat_sessions
export async function getSessionsByBotId(bot_id: string) {
  if (!bot_id) return;
  return instance.get<ConversationType[]>(`/b/${bot_id}/chat_sessions`);
}