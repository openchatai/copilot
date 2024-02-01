import { Message } from "@lib/types";
import axios, { AxiosInstance } from "axios";

export function createAxiosInstance({
  apiUrl,
  sessionId,
  botToken,
}: {
  apiUrl: string;
  sessionId: string;
  botToken: string;
}) {
  const instance = axios.create({
    baseURL: apiUrl,
    headers: {
      "X-Session-Id": sessionId,
      "X-Bot-Token": botToken,
    },
  });

  instance.interceptors.request.use((config) => {
    config.data = {
      ...config.data,
      session_id: sessionId,
    };
    return config;
  });
  return instance;
}
type HistoryMessage = {
  chatbot_id: string;
  created_at: string;
  from_user: boolean;
  id: number;
  message: string;
  session_id: string;
  updated_at: string;
};

export function historyToMessages(history?: HistoryMessage[]): Message[] {
  const $messages: Message[] = [];

  if (history) {
    history.forEach((m) => {
      if (m.from_user) {
        $messages.push({
          from: "user",
          content: m.message,
          id: m.id,
          timestamp: new Date(m.created_at),
        });
      } else {
        $messages.push({
          from: "bot",
          id: m.id,
          timestamp: new Date(m.created_at),
          type: "text",
          response: {
            text: m.message,
          },
        });
      }
    });
  }
  return $messages;
}
export async function getInitialData(instance: AxiosInstance) {
  const { data } = await instance.get<{
    bot_name: string;
    logo: string;
    history: HistoryMessage[];
    initial_questions: string[];
  }>("/chat/init");
  const history = historyToMessages(data.history);
  return {
    ...data,
    history,
  };
}
