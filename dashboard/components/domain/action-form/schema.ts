import { apiMethods } from "@/types/utils";
import z from "zod";

export enum MIN_CHARS {
    NAME = 5,
    DESCRIPTION = 20,
}

export const actionSchema = z.object({
    name: z.string().min(MIN_CHARS.NAME),
    description: z.string().min(MIN_CHARS.DESCRIPTION),
    request_type: z.enum(apiMethods, {
        required_error: "Please select a request type",
    }),
    api_endpoint: z.string().url('Please enter a valid URL').min(1),
    headers: z.array(z.object({
        key: z.string().min(1),
        value: z.string()
    })).optional(),
    parameters: z.array(z.object({
        key: z.string().min(1),
        value: z.string()
    })).optional(),
    body: z.string().optional()
        .refine((value) => {
            if (typeof value === 'string' && value.trim().length === 0) {
                return true;
            }
            try {
                if (typeof value !== 'string') {
                    return false;
                }
                JSON.parse(value);
                return true;
            } catch (e) {
                return false;
            }
        }, {
            message: 'Please enter a valid JSON string'
        })

    , // should be a valid JSON string
});

export type ActionType = z.infer<typeof actionSchema>;