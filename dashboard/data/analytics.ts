import axios from "axios";
import { baseUrl } from "./base-url";

const instance = axios.create({
    baseURL: baseUrl + "/backend",
});

// /chat/actions/most_called/:bot_id
export async function getMostCalledActions(bot_id: string) {
    return instance.get(`/chat/actions/most_called/${bot_id}`);
}

// analytics data 
export async function getAnalyticsData(id: string) {
    return instance.get<{
      api_called_count: number;
      knowledgebase_called_count:number;
      other_count: number;
    }[]>(`analytics/${id}`)
  }