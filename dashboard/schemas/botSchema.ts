import * as v from "valibot";
import type { Output } from "valibot";

export const botSchema = v.object({
    id: v.string(),
    name: v.string(),
    website: v.string(),
    promptMessage: v.string(),
    token: v.string(),
});

export type Bot = Output<typeof botSchema>;