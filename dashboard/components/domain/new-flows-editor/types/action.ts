import { SharedFields } from "./utils";

type PayloadType = {
    parameters: {
        in: string;
        name: string;
        schema: {
            type: string;
        };
        example: string;
        required: boolean;
    }[];
    request_body: {};
}

const API_METHODS = ['GET', "POST", "DELETE", "PUT"] as const;
type ApiMethodsType = typeof API_METHODS[number];

export type ActionType = {
    name: string,
    description: string,
    api_endpoint: string,
    status: 'live' | 'draft',
    request_type: ApiMethodsType,
    id: string;
    bot_id: string;
    operation_id: string;
    payload: any;
    created_at: string;
    updated_at: string;
    deleted_at: string | null; // Assuming it can be null
} & SharedFields;