import { createSafeContext } from '@/lib/createSafeContext'
import React, { useCallback, useReducer } from 'react'
import { produce } from 'immer';
import { Union } from './types/utils';
import { ActionType } from './types/action';

const [ControllerProvider, useController] = createSafeContext('Controller');

type ActionsType = Union<[{
    type: "RESET",
}, {
    type: "LOAD_ACTIONS",
    payload: ActionType[]
}]>;

type StateType = {
    name: string | null,
    description: string | null,
    actions: ActionType[],
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

function Controller({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(stateReducer, initialState);

    const loadActions = useCallback((actions: ActionType[]) => {
        dispatch({ type: "LOAD_ACTIONS", payload: actions })
    }, [])

    const reset = useCallback(() => {
        dispatch({ type: "RESET" })
    }, [])

    return <ControllerProvider value={{ state }}>
        {children}
    </ControllerProvider>
}


export { useController, Controller }