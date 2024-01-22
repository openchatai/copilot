import { apiMethods } from "@/types/utils";
import z from "zod";

export enum MIN_CHARS {
    NAME = 5,
    DESCRIPTION = 20,
}
// make parameter.value optional if is_magic is true

export const actionSchema = z.object({
    name: z.string().min(MIN_CHARS.NAME),
    description: z.string().min(MIN_CHARS.DESCRIPTION),
    request_type: z.enum(apiMethods, {
        required_error: "Please select a request type",
    }),
    api_endpoint: z.string().url('Please enter a valid URL').min(1),
    headers: z.array(z.object({
        key: z.string().min(1),
        value: z.string(),
        is_magic: z.boolean().optional().default(false),
    })).optional().refine((val) => {
        if (!val) {
            return true;
        }
        return val.every((param) => {
            if (param.is_magic) {
                return true;
            }
            if (param.value) {
                return true;
            }
            return false;
        });
    }),
    parameters: z.array(z.object({
        key: z.string().min(1),
        value: z.string().optional(),
        is_magic: z.boolean().optional().default(false),
    })).optional().refine((val) => {
        if (!val) {
            return true;
        }
        return val.every((param) => {
            if (param.is_magic) {
                return true;
            }
            if (param.value) {
                return true;
            }
            return false;
        });
    }),
    body: z.string().default("{}").optional().refine((val) => {
        if (!val) {
            return true;
        }
        try {
            JSON.parse(val);
            return true;
        } catch (e) {
            return false;
        }
    }, "invalid JSON object"),
});

export type ActionType = z.infer<typeof actionSchema>;