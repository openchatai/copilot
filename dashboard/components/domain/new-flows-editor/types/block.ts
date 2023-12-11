import { Node } from "reactflow";
import { CombineTypes, SharedFields } from "./utils";

export type BlockType = CombineTypes<[{
    name: string;
    description: string;
    next_on_success:string // just a block id 
}, SharedFields]>

export type BlockNodeType = Node<BlockType>;
