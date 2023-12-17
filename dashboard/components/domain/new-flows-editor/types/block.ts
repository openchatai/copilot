import { Node } from "reactflow";
import { SharedFields } from "./utils";
import { CombineTypes } from "@/types/utils";
import { ActionResponseType } from "@/data/actions";

export type BlockType = CombineTypes<[{
    name: string;
    next_on_success: string | null // just a block id 
    actions: ActionResponseType[]
}, SharedFields]>

export type BlockNodeType = Node<BlockType>;
