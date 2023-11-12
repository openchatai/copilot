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
// success => Datasource ingestion started successfully.http://127.0.0.1:8888/backend/uploads/file/ingest
export async function ingestDataSources(filenames: string[], bot_id: string) {
  return await instance.post<string>("/uploads/file/ingest", {
    filenames,
    bot_id,
  });
}

export async function getDataSourcesByBotId(bot_id: string) {
  return await instance.get<{
    pdf_sources: any[];
    web_sources: {
      chatbot_id: string;
      id: string;
      source: string;
      status: string;
      updated_at: string;
    }[];
  }>(`/data_sources/b/${bot_id}`);
}
