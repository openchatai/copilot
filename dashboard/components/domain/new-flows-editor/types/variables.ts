import { Union } from "@/types/utils"

type StaticType = {
    type: "STATIC",
    value: string,
    name: string
}
type MagicType = {
    type: "MAGIC",
    name: string
}
type RuntimeType = {
    type: "RUNTIME",
    name: string;
    value: string; // pathType of the response/ of any previous action 
}

export type VariableType = Union<[StaticType, MagicType, RuntimeType]>;
