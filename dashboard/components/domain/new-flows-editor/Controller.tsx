'use client';
import { createSafeContext } from '@/lib/createSafeContext'
import React, { useCallback, useReducer } from 'react'
import { produce } from 'immer';
import { Union } from '@/types/utils';
import { ActionResponseType, getActionsByBotId } from '@/data/actions';
import { useCopilot } from '@/app/(copilot)/copilot/_context/CopilotProvider';
import useSWR, { mutate } from 'swr';
import { BlockType } from './types/block';
import _ from 'lodash';


type ControllerType = {
    state: StateType,
    // eslint-disable-next-line no-unused-vars
    loadActions: (actions: ActionResponseType[]) => void,
    reset: () => void,
    // eslint-disable-next-line no-unused-vars
    updateBlock: (blockId: string, block: Partial<BlockType>) => void,
    // eslint-disable-next-line no-unused-vars
    reorderActions: (sourceIndex: number, destinationIndex: number) => void,
    // eslint-disable-next-line no-unused-vars
    addActionToBlock: (blockId: string, action: ActionResponseType, index: number) => void,
    // eslint-disable-next-line no-unused-vars
    reorderActionsInBlock: (blockId: string, sourceIndex: number, destinationIndex: number) => void,
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
}]>;

type StateType = {
    name: string | null,
    description: string | null,
    actions: ActionResponseType[],
    blocks: BlockType[],
}

const initialState: StateType = {
    name: null,
    description: null,
    actions: [],
    blocks: [{
        id: "block-1",
        name: "Start",
        created_at: new Date().toISOString(),
        next_on_success: null,
        updated_at: new Date().toISOString(),
        actions: [{
            id: "action-1",
            name: "Create User",
            description: "Create a new user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            request_type: "POST",
            api_endpoint: "https://api.example.com/users",
            operation_id: "create_user",
            deleted_at: null,
        }],
    }],
}
export function reorderList<T extends any>(list: T[], startIndex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    if (!removed) return [...result];
    result.splice(endIndex, 0, removed);
    return [...result];
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
                    block.actions.splice(index, 0, $action);
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
        }
    })
}

function FlowsControllerV2({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(stateReducer, initialState);
    const { id: copilotId } = useCopilot();
    console.log("copilotId", state)
    useSWR("actions/" + copilotId, async () => (await getActionsByBotId(copilotId)).data, {
        onSuccess: (data) => {
            dispatch({ type: "LOAD_ACTIONS", payload: data })
        }
    });

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
    return <ControllerProvider value={{ state, loadActions, reset, updateBlock, reorderActions, addActionToBlock, reorderActionsInBlock }}>
        {children}
    </ControllerProvider>
}

export const revalidateActions = (copilotId: string) => mutate(copilotId + '/actions');

export { useController, FlowsControllerV2 }