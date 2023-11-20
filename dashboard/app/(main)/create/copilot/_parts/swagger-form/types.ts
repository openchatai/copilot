import { FormValues } from "./form";

export const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD", "TRACE", "CONNECT"] as const;
export type Method = typeof methods[number];
export type FormValuesWithId = FormValues & { id: string };
