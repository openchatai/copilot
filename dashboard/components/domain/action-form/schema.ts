import { apiMethods } from "@/types/utils";
import z from "zod";

export const actionSchema = z.object({
    name: z.string().min(5),
    description: z.string().min(20),
    request_type: z.enum(apiMethods),
    api_endpoint: z.string().url(),

    headers: z.array(z.object({
        key: z.string().min(1),
        value: z.string()
    })).optional(),

    parameters: z.array(z.object({
        key: z.string().min(1),
        value: z.string()
    })).optional(),
});

export type ActionType = z.infer<typeof actionSchema>;