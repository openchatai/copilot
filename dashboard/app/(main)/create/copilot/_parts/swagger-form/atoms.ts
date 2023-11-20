import { atom } from "jotai";
import { FormValues } from "./form";
type FormValuesWithId = FormValues & { id: string };
export const swaggerEndpointsAtom = atom<FormValuesWithId[]>([]);
export const currentlyEditingEndpointIdAtom = atom<string | null>(null);