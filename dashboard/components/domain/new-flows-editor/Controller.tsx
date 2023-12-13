'use client';
import { createSafeContext } from '@/lib/createSafeContext'
import React, { useCallback, useReducer } from 'react'
import { produce } from 'immer';
import { Union } from '@/types/utils';
import { ActionResponseType, getActionsByBotId } from '@/data/actions';
import { useCopilot } from '@/app/(copilot)/copilot/_context/CopilotProvider';
import useSWR, { mutate } from 'swr';

type ControllerType = {
    state: StateType,
    // eslint-disable-next-line no-unused-vars
    loadActions: (actions: ActionResponseType[]) => void,
    reset: () => void,
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
}]>;

type StateType = {
    name: string | null,
    description: string | null,
    actions: ActionResponseType[],
    blocks: any[],
}

const initialState: StateType = {
    name: null,
    description: null,
    actions: [],
    blocks: [],
}

function stateReducer(state: StateType, action: ActionsType) {
    return produce(state, (draft) => {
        switch (action.type) {
            case "RESET":
                return initialState;
            case "LOAD_ACTIONS":
                draft.actions = action.payload;
                return;
        }
    })
}

function FlowsControllerV2({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(stateReducer, initialState);
    const { id: copilotId } = useCopilot();
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

    return <ControllerProvider value={{ state, loadActions, reset }}>
        {children}
    </ControllerProvider>
}

export const revalidateActions = (copilotId: string) => mutate(copilotId + '/actions');

export { useController, FlowsControllerV2 }