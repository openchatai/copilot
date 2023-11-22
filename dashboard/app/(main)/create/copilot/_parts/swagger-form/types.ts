import zod from 'zod';
export const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD", "TRACE", "CONNECT"] as const;
export type Method = typeof methods[number];
export type FormValuesWithId = FormValues & { id: string };
export const swaggerFormSchema = zod.object({
    url: zod.string().url("Invalid URL, please provide a valid one"),
    method: zod.enum(methods),
    title: zod.string(),
    summary: zod.string(),
    headers: zod.array(zod.object({
        key: zod.string(),
        value: zod.string()
    })).optional(),
    parameters: zod.array(zod.object({
        key: zod.string(),
        value: zod.string()
    })).optional()
})
export type FormValues = zod.infer<typeof swaggerFormSchema>