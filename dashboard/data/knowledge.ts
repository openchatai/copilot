import axios from "axios";
import { baseUrl } from "./base-url";
const instance = axios.create({
  baseURL: baseUrl + "/backend",
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


export type RawDatasource = {
  chatbot_id: string;
  id: string;
  source: string;
  status: "SUCCESS" | "COMPLETED" | "FAILED" | "PENDING";
  updated_at: string;
};

export type DataSources = {
  id: string;
  name: string;
  type: string;
  status: RawDatasource["status"];
  date: Date | number | string;
  source: string;
};

export async function getDataSourcesByBotId(
  bot_id: string,
): Promise<DataSources[]> {
  const { data } = await instance.get<{
    pdf_sources: RawDatasource[];
    web_sources: RawDatasource[];
  }>(`/data_sources/b/${bot_id}`);
  const datasources: DataSources[] = [];
  if (data) {
    data.web_sources.forEach((item) => {
      datasources.push({
        id: item.id,
        name: item.source,
        type: "URL",
        status: item.status,
        date: item.updated_at,
        source: item.source,
      });
    });
    data.pdf_sources.forEach((item) => {
      datasources.push({
        id: item.id,
        name: item.source,
        type: "File",
        status: item.status,
        date: item.updated_at,
        source: item.source,
      });
    });
  }
  return datasources;
}
