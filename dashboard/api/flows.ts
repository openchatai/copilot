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


export const getWorkflowById = (id: string): Promise<Workflow> => {
    return axios.get(`/backend/flows/${id}`);
}


export const createWorkflowFromSwagger = (swaggerUrl: string): Promise<Workflow> => {
    return axios.post(`/backend/flows/u/${swaggerUrl}`);
}


export const getWorkflowsBySwagger = (swagger_url: string): Promise<PaginatedWorkflows> => {
    return axios.get(`/backend/flows/b/${swagger_url}`);
}


export const updateWorkflowById = (
    id: string,
    data: Partial<Workflow>
): Promise<Workflow> => {
    return axios.put(`/backend/flows/${id}`, data);
}


export const deleteWorkflowById = (id: string): Promise<void> => {
    return axios.delete(`/backend/flows/${id}`);
}


export const runWorkflow = (data: any): Promise<{response: string}> => {
    return axios.post('/backend/flows/run_workflow', data);
}
