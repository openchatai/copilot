import axios from "axios";
import { baseUrl } from "./base-url";
import _ from "lodash";

const instance = axios.create({
  baseURL: baseUrl + "/backend",
});
type MostCalledActionResponseType = {
  count: number;
  operation_id: string;
}

// /chat/actions/most_called/:bot_id
export async function getMostCalledActions(bot_id: string) {
  return (await instance.get<MostCalledActionResponseType[]>(`/chat/actions/most_called/${bot_id}`)).data
}

// analytics data 
export async function getAnalyticsData(id: string) {
  const data = (await instance.get<{
    api_called_count: number;
    knowledgebase_called_count: number;
    other_count: number;
    total: number;
  }[]>(`/chat/analytics/${id}`)).data
  if (_.isEmpty(data)) {
    return {
      api_called_count: 0,
      knowledgebase_called_count: 0,
      other_count: 0,
      total: 0,
    }
  } else {
    return data[0]
  }
}