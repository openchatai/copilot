import { Edge } from "reactflow";
import { BlockNodeType, BlockType } from "./types/block";
import _ from "lodash";
function orderBlocksByNextOnSuccess(blocks: BlockType[]) {
    // order blocks based on next_on_success
    // every block should have a next_on_success that points to the next block in the flow
    // if there is no next_on_success, the block should be the last block in the flow
    // add isLast to the blocks, isFirst to the blocks
    const orderedBlocks: BlockType[] = [];
    const blocksById = _.keyBy(blocks, "id");
    let currentBlock: null | any = blocks[0];
    while (currentBlock) {
        orderedBlocks.push(currentBlock);
        const nextId = currentBlock.next_on_success;
        if (nextId) {
            currentBlock = blocksById[nextId];
        } else {
            currentBlock = null;
        }
    }
    return orderedBlocks;
}
export function autoLayout(blocks: BlockType[]) {
    const orderedBlocks = orderBlocksByNextOnSuccess(blocks);
    const newNodes: BlockNodeType[] = orderedBlocks.map((block, index) => {
        // order blocks based on next_on_success
        return {
            position: {
                x: 500 * index,
                y: 0,
            },
            draggable: false,
            type: "actionBlock",
            id: block.id,
            data: block,
        };
    });
    const edges: Edge[] = newNodes.map((node) => {
        const nextId = node.data.next_on_success;
        const next = newNodes.find((n) => n.id === nextId);

        if (next) {
            return {
                id: node.id + "|" + next.id,
                target: next.id,
                source: node.id,
                type: "BlockEdge",
                animated: true,
            };
        }
    }).filter((v) => typeof v !== "undefined") as Edge[];
    return {
        newNodes,
        edges,
    };
}