import axios from "axios";
const axiosInstance = axios.create({
  baseURL: "http://localhost:8888",
  headers: {
    Accept: "application/json",
  },
});
// @todo to be added by falta [ DONE ]
type Workflow = {
  _id: string;
  bot_id: string;
  info: {
    title: string;
    version: string;
  };
  flows: {
    name: string;
    description: string;
    steps: {
      open_api_operation_id: string;
      operation: "call" | "req";
      stepId: string;
    }[];
  }[];
};

interface PaginatedWorkflows {
  workflows: Workflow[];
  page: number;
  page_size: number;
  total_workflows: number;
}
export const getWorkflowById = (id: string) => {
  return axiosInstance.get<Workflow>(`/backend/flows/${id}`);
};

export const createWorkflowFromSwagger = (
  swaggerUrl: string
): Promise<Workflow> => {
  return axiosInstance.post(`/backend/flows/u/${swaggerUrl}`);
};

export const getWorkflowsBySwagger = (swagger_url: string) => {
  return axiosInstance.get<PaginatedWorkflows>(
    `/backend/flows/b/${swagger_url}`
  );
};

export const updateWorkflowById = (id: string, data: Partial<Workflow>) => {
  return axiosInstance.put<Workflow>(`/backend/flows/${id}`, data);
};

export const deleteWorkflowById = (id: string) => {
  return axiosInstance.delete<void>(`/backend/flows/${id}`);
};

export const runWorkflow = (data: any) => {
  return axiosInstance.post<{ response: string }>(
    "/backend/flows/run_workflow",
    data
  );
};
export const getWorkflowsByBotId = (bot_id: string, searchParams?: string) => {
  const url = "/backend/flows/get/b/" + bot_id;
  return axiosInstance.get<PaginatedWorkflows>(url);
};
