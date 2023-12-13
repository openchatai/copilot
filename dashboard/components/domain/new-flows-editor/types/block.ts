import { Node } from "reactflow";
import { SharedFields } from "./utils";
import { CombineTypes } from "@/types/utils";

export type BlockType = CombineTypes<[{
    name: string;
    description: string;
    next_on_success: string // just a block id 
}, SharedFields]>

export type BlockNodeType = Node<BlockType>;
