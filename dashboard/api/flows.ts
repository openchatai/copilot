import axios from "axios";

// @todo to be added by falta
type Workflow = any;

interface PaginatedWorkflows {
  workflows: Workflow[];
  page: number;
  page_size: number;
  total_workflows: number;
}

interface Bot {
  id: string;
  // ...other bot fields
}

export const getWorkflowById = (id: string) => {
  return axios.get<Workflow>(`/backend/flows/${id}`);
};

export const createWorkflowFromSwagger = (
  swaggerUrl: string
): Promise<Workflow> => {
  return axios.post(`/backend/flows/u/${swaggerUrl}`);
};

export const getWorkflowsBySwagger = (swagger_url: string) => {
  return axios.get<PaginatedWorkflows>(`/backend/flows/b/${swagger_url}`);
};

export const updateWorkflowById = (id: string, data: Partial<Workflow>) => {
  return axios.put<Workflow>(`/backend/flows/${id}`, data);
};

export const deleteWorkflowById = (id: string) => {
  return axios.delete<void>(`/backend/flows/${id}`);
};

export const runWorkflow = (data: any) => {
  return axios.post<{ response: string }>("/backend/flows/run_workflow", data);
};
