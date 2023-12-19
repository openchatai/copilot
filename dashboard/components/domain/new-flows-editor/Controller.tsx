/* eslint-disable no-unused-vars */
'use client';
import { createSafeContext } from '@/lib/createSafeContext'
import React, { useCallback, useReducer } from 'react'
import { produce } from 'immer';
import { Union } from '@/types/utils';
import { ActionResponseType } from '@/data/actions';
import { mutate } from 'swr';
import { BlockType } from './types/block';
import _, { uniqueId } from 'lodash';
import { atom, useAtom } from 'jotai';
import { ReactFlowProvider } from 'reactflow';

const selectedNodeIds = atom<string[]>([]);

export const useSelectedNodes = () => useAtom(selectedNodeIds);

type ControllerType = {
    state: StateType,
    loadActions: (actions: ActionResponseType[]) => void,
    reset: () => void,
    updateBlock: (blockId: string, block: Partial<BlockType>) => void,
    reorderActions: (sourceIndex: number, destinationIndex: number) => void,
    addActionToBlock: (blockId: string, action: ActionResponseType, index: number) => void,
    reorderActionsInBlock: (blockId: string, sourceIndex: number, destinationIndex: number) => void,
    deleteBlock: (blockId: string) => void,
    deleteActionFromBlock: (blockId: string, actionId: string) => void,
    addNextOnSuccess: (sourceId: string, destinationId: string) => void,
    deleteBlockById: (blockId: string) => void,
    insertEmptyBlockAfter: (sourceId?: string) => void,
    insertEmptyBlockBefore: (sourceId?: string) => void,
    moveActionFromBlockToBlock: (sourceBlockId: string, destinationBlockId: string, index: number, action_id: string) => void,
    dispatch: React.Dispatch<ActionsType>,
}
const [ControllerProvider, useController] = createSafeContext<ControllerType>('Controller');

type ActionsType = Union<[{
    type: "RESET",
}, {
    type: "LOAD_ACTIONS",
    payload: ActionResponseType[]
}, {
    type: "APPEND_BLOCK_AFTER",
    payload: {
        blockId: string,
        blockType: "ON_SUCCESS"
    }
}, {
    type: "ADD_BLOCK",
    payload: {
        blockType: "ON_ERROR" | "ON_SUCCESS" | null
    }
}, {
    type: "UPDATE_BLOCK",
    payload: {
        blockId: string,
        data: Partial<BlockType>
    }
}, {
    type: "REORDER_ACTIONS",
    payload: {
        sourceIndex: number,
        destinationIndex: number,
    }
}, {
    type: "ADD_ACTION_TO_BLOCK",
    payload: {
        blockId: string,
        action: ActionResponseType,
        index: number,
    }
}, {
    type: "REORDER_ACTIONS_IN_BLOCK",
    payload: {
        blockId: string,
        sourceIndex: number,
        destinationIndex: number,
    }
}, {
    type: "DELETE_BLOCK",
    payload: {
        blockId: string,
    }
}, {
    type: "DELETE_ACTION_FROM_BLOCK",
    payload: {
        actionId: string,
        blockId: string,
    }
}, {
    type: "ADD_EMPTY_NEXT_ON_SUCCESS_BETWEEN",
    payload: {
        sourceId: string,
        destinationId: string,
    }
}, {
    type: "DELETE_BLOCK_BY_ID",
    payload: {
        blockId: string
    }
}, {
    type: "INSERT_EMPTY_BLOCK_AFTER",
    payload?: {
        sourceId?: string,
    }
}, {
    type: "MOVE_ACTION_FROM_BLOCK_TO_BLOCK",
    payload: {
        sourceBlockId: string,
        destinationBlockId: string,
        index: number,
        action_id: string,
    }
}, {
    type: "SET_WORKFLOW_DATA",
    payload: Partial<StateType>
}, {
    type: "INSERT_EMPTY_BLOCK_BEFORE",
    payload: {
        sourceId?: string,
    }
}, {
    type: "PATCH_CREATE_BLOCKS_FROM_ACTIONS",
    payload: ActionResponseType[]
}]>;

type StateType = {
    name: string | null,
    description: string | null,
    actions: ActionResponseType[],
    blocks: BlockType[],
    flow_id: string | null,
}

const initialState: StateType = {
    name: null,
    flow_id: null,
    description: null,
    actions: [],
    blocks: [],
}
export function reorderList<T extends any>(list: T[], startIndex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    if (!removed) return [...result];
    result.splice(endIndex, 0, removed);
    return [...result];
}
function getEmptyBlock(next_on_success: string | null, actions?: ActionResponseType[]): BlockType {
    const id = "block-" + uniqueId();
    return {
        id: id,
        name: id,
        created_at: new Date().toISOString(),
        next_on_success,
        updated_at: null,
        actions: actions ?? [],
    }

}
function stateReducer(state: StateType, action: ActionsType) {
    return produce(state, (draft) => {
        switch (action.type) {
            case "RESET":
                return initialState;
            case "LOAD_ACTIONS":
                draft.actions = action.payload;
                return;
            case "UPDATE_BLOCK": {
                // not all data will change, so we need to merge the data
                const { blockId, data } = action.payload;
                const block = draft.blocks.find(block => block.id === blockId);
                if (block) {
                    _.assign(block, data);
                }
                return;
            }
            case "ADD_ACTION_TO_BLOCK": {
                const { blockId, action: $action, index } = action.payload;
                const block = draft.blocks.find(block => block.id === blockId);
                if (block) {
                    // if the action id is already present,change the id and add it
                    const action = { ...$action };
                    action.id = uniqueId();
                    block.actions.splice(index, 0, action);
                }
                return;
            }
            case "REORDER_ACTIONS": {
                const { sourceIndex, destinationIndex } = action.payload;
                draft.actions = reorderList(draft.actions, sourceIndex, destinationIndex);
                return;
            }
            case "REORDER_ACTIONS_IN_BLOCK": {
                const { blockId, sourceIndex, destinationIndex } = action.payload;
                const block = draft.blocks.find(block => block.id === blockId);
                if (block) {
                    block.actions = reorderList(block.actions, sourceIndex, destinationIndex);
                }
                return;
            }
            case "DELETE_BLOCK": {
                const { blockId } = action.payload;
                draft.blocks = draft.blocks.filter(block => block.id !== blockId);
                return;
            }
            case "DELETE_ACTION_FROM_BLOCK": {
                const { blockId, actionId } = action.payload;
                const block = draft.blocks.find(block => block.id === blockId);
                if (block) {
                    block.actions = block.actions.filter(action => action.id !== actionId);
                }
                return;
            }
            case "ADD_EMPTY_NEXT_ON_SUCCESS_BETWEEN": {
                // add empty block between two blocks
                const { sourceId, destinationId } = action.payload;
                const sourceBlock = draft.blocks.find(block => block.id === sourceId);
                const destinationBlock = draft.blocks.find(block => block.id === destinationId);
                if (sourceBlock && destinationBlock) {
                    const newBlock: BlockType = getEmptyBlock(destinationId)
                    draft.blocks.push(newBlock);
                    sourceBlock.next_on_success = newBlock.id;
                }
                return;
            }
            case "DELETE_BLOCK_BY_ID": {
                const { blockId } = action.payload;
                // delete the block and update the next_on_success of the previous block
                const block = draft.blocks.find(block => block.id === blockId);
                if (!block) return;
                const previousBlock = draft.blocks.find(block => block.next_on_success === blockId);
                if (previousBlock) {
                    previousBlock.next_on_success = block.next_on_success;
                }
                draft.blocks = draft.blocks.filter(block => block.id !== blockId);
                return;
            }
            case "INSERT_EMPTY_BLOCK_AFTER": {
                // will inset empty block after the source block (if present); else will insert at the end
                if (action.payload?.sourceId) {
                    const { sourceId } = action.payload;
                    const sourceBlock = draft.blocks.find(block => block.id === sourceId);
                    if (!sourceBlock) return;
                    const newBlock: BlockType = getEmptyBlock(sourceBlock.next_on_success)
                    draft.blocks.push(newBlock);
                    sourceBlock.next_on_success = newBlock.id;
                } else {
                    const newBlock: BlockType = getEmptyBlock(null);
                    draft.blocks.push(newBlock);
                }
                return;
            }
            case "INSERT_EMPTY_BLOCK_BEFORE": {
                // will inset empty block before the source block (if present); else will insert at the end
                if (action.payload?.sourceId) {
                    const { sourceId } = action.payload;
                    const sourceBlock = draft.blocks.find(block => block.next_on_success === sourceId);
                    if (!sourceBlock) return;
                    const newBlock: BlockType = getEmptyBlock(sourceId);
                    draft.blocks.push(newBlock);
                    sourceBlock.next_on_success = newBlock.id;
                } else {
                    const newBlock: BlockType = getEmptyBlock(null);
                    draft.blocks.push(newBlock);
                }
                return;
            }
            case "MOVE_ACTION_FROM_BLOCK_TO_BLOCK": {
                const { sourceBlockId, destinationBlockId, index, action_id } = action.payload;
                const sourceBlock = draft.blocks.find(block => block.id === sourceBlockId);
                const destinationBlock = draft.blocks.find(block => block.id === destinationBlockId);
                if (sourceBlock && destinationBlock) {
                    const action = sourceBlock.actions.find(action => action.id === action_id);
                    if (action) {
                        destinationBlock.actions.splice(index, 0, action);
                        sourceBlock.actions = sourceBlock.actions.filter(action => action.id !== action_id);
                    }
                }
                return;
            }
            case "SET_WORKFLOW_DATA": {
                _.assign(draft, action.payload)
                return;
            }
            case "PATCH_CREATE_BLOCKS_FROM_ACTIONS": {
                // create blocks for each action
                draft.blocks = action.payload.map(action => {
                    return getEmptyBlock(null, [{ ...action, id: uniqueId() }]);
                })
                    .map((prev, index, arr) => {
                        const next = arr?.[index + 1];
                        if (next) {
                            prev.next_on_success = next.id;
                        }
                        return prev;
                    })
                return;
            }
            default:
                return;
        }
    })
}

export const revalidateWorkflow = (copilotId: string, workflow_id: string) => mutate(copilotId + '/flow/' + workflow_id);

function FlowsControllerV2({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(stateReducer, initialState);

    // useCallback Hell :( 
    const loadActions = useCallback((actions: ActionResponseType[]) => {
        dispatch({ type: "LOAD_ACTIONS", payload: actions })
    }, [])
    const reset = useCallback(() => {
        dispatch({ type: "RESET" })
    }, [])
    const updateBlock = useCallback((blockId: string, block: Partial<BlockType>) => {
        dispatch({ type: "UPDATE_BLOCK", payload: { blockId, data: block } })
    }, [])
    const reorderActions = useCallback((sourceIndex: number, destinationIndex: number) => {
        dispatch({ type: "REORDER_ACTIONS", payload: { sourceIndex, destinationIndex } })
    }
        , [])
    const addActionToBlock = useCallback((blockId: string, action: ActionResponseType, index: number) => {
        dispatch({ type: "ADD_ACTION_TO_BLOCK", payload: { blockId, action, index } })
    }
        , [])
    const reorderActionsInBlock = useCallback((blockId: string, sourceIndex: number, destinationIndex: number) => {
        dispatch({ type: "REORDER_ACTIONS_IN_BLOCK", payload: { blockId, sourceIndex, destinationIndex } })
    }
        , [])
    const deleteBlock = useCallback((blockId: string) => {
        dispatch({ type: "DELETE_BLOCK", payload: { blockId } })
    }
        , [])
    const deleteActionFromBlock = useCallback((blockId: string, actionId: string) => {
        dispatch({ type: "DELETE_ACTION_FROM_BLOCK", payload: { blockId, actionId } })
    }
        , [])
    const addNextOnSuccess = useCallback((sourceId: string, destinationId: string) => {
        dispatch({ type: "ADD_EMPTY_NEXT_ON_SUCCESS_BETWEEN", payload: { sourceId, destinationId } })
    }
        , [])
    const deleteBlockById = useCallback((blockId: string) => {
        dispatch({ type: "DELETE_BLOCK_BY_ID", payload: { blockId } })
    }
        , [])
    const insertEmptyBlockAfter = useCallback((sourceId?: string) => {
        dispatch({ type: "INSERT_EMPTY_BLOCK_AFTER", payload: { sourceId } })
    }
        , [])
    const moveActionFromBlockToBlock = useCallback((sourceBlockId: string, destinationBlockId: string, index: number, action_id: string) => {
        dispatch({ type: "MOVE_ACTION_FROM_BLOCK_TO_BLOCK", payload: { sourceBlockId, destinationBlockId, index, action_id } })
    }
        , [])
    const insertEmptyBlockBefore = useCallback((sourceId?: string) => {
        dispatch({ type: "INSERT_EMPTY_BLOCK_BEFORE", payload: { sourceId } })
    }
        , [])

    return (

        <ReactFlowProvider>
            <ControllerProvider value={{ insertEmptyBlockBefore, dispatch, insertEmptyBlockAfter, moveActionFromBlockToBlock, state, deleteBlockById, addNextOnSuccess, deleteActionFromBlock, loadActions, reset, updateBlock, reorderActions, addActionToBlock, reorderActionsInBlock, deleteBlock }}>
                {children}
            </ControllerProvider>
        </ReactFlowProvider>
    )
}

export const revalidateActions = (copilotId: string) => mutate(copilotId + '/actions');

export { useController, FlowsControllerV2 }