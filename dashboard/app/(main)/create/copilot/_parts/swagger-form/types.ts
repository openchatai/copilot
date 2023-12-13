import zod from 'zod';
import { actionSchema } from "@/components/domain/action-form/schema";

export type FormValuesWithId = FormValues & { id: string };
export type FormValues = zod.infer<typeof actionSchema>