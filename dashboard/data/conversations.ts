import axios from "axios";
import { baseUrl } from "./base-url";
import { WithPagination } from "@/types/data-utils";
const instance = axios.create({
  baseURL: baseUrl + "/backend/chat",
});
type DebugDataType = {}
export type ChatMessageType = {
  id: string;
  chatbot_id: string;
  session_id: string;
  message: string;
  from_user: boolean;
  created_at: string;
  debug_json: null | string;
};
// http://localhost:8888/backend/chat/sessions/:sessionId/chats
export async function getConversationBySessionId(sessionId: string, page: number = 1, limit: number = 30) {
  if (!sessionId) return;
  return (await instance.get<WithPagination<ChatMessageType[]>>(`/sessions/${sessionId}/chats/?page=${page}&limit=${limit}`)).data;
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
export async function getSessionsByBotId(bot_id: string, page: number = 1, limit: number = 20) {
  if (!bot_id) return;
  return instance.get<WithPagination<ConversationType[]>>(`/b/${bot_id}/chat_sessions?page=${page}&limit=${limit}`);
}