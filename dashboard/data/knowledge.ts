import axios from "axios";
const instance = axios.create({
  baseURL: "http://localhost:8888/backend",
});

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await instance.post<{
    file_path: string;
    filename: string;
    success: string;
  }>("/uploads/server/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}
// success => Datasource ingestion started successfully.
export async function ingestDataSources(file_names: string[], bot_id: string) {
  return await instance.post<string>(`/data/ingest`, {
    file_names,
    bot_id,
  });
}

export async function getDataSourcesByBotId(bot_id: string) {
  return await instance.get<
    {
      chatbot_id: string;
      files: string;
      id: number;
      status: string;
      updated_at: string;
    }[]
  >(`/data_sources/b/${bot_id}`);
}
