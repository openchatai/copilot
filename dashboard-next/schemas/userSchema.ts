import * as v from "valibot";
import { type Output } from "valibot";
export const userSchema = v.object({
    id: v.number(),
    name: v.string(),
    email: v.string(),
    source: v.string(),
    ref: v.nullable(v.string()),
    email_verified_at: v.nullable(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
    token: v.string(),
})

export type UserType = Output<typeof userSchema>;