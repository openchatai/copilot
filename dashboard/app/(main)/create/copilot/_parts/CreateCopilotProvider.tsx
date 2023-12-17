import type { CopilotType } from "@/data/copilot";
import { createSafeContext } from "@/lib/createSafeContext";
import React from "react";
import { produce } from "immer";
import { mutate } from "swr";

export const revalidateActions = (copilot_id: string) => mutate(copilot_id + '/actions')

type State = {
  createdCopilot?: CopilotType;
  isLoading?: boolean;
  swaggerFiles?: File[] | null;
  currentlyEditingEndpointId?: string | null;
  copilot_name: string
};

const actionTypes = {
  ADD_SWAGGER: "ADD_SWAGGER",
  SET_COPILOT: "SET_COPILOT",
  CHANGE_NAME: "CHANGE_NAME",
} as const;

type ActionType = typeof actionTypes;

type Action =
  | {
    type: ActionType["SET_COPILOT"];
    payload: CopilotType;
  }
  | {
    type: ActionType["ADD_SWAGGER"];
    payload: File[] | null;
  }
  | {
    type: "CHANGE_NAME",
    payload: string
  }

const [CreateCopilotSafeProvider, useCreateCopilot] = createSafeContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>("");

function reducer(state: State, action: Action) {
  return produce(state, (draft) => {
    switch (action.type) {
      case actionTypes.SET_COPILOT:
        draft.createdCopilot = action.payload;
        break;
      case actionTypes.ADD_SWAGGER:
        draft.swaggerFiles = action.payload;
        break;
      case "CHANGE_NAME":
        draft.copilot_name = action.payload;
        break;
    }
  });
}

function CreateCopilotProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, {
    swaggerFiles: [],
    createdCopilot: undefined,
    copilot_name: "My Copilot"
  });
  return (
    <CreateCopilotSafeProvider value={{ state, dispatch }}>
      {children}
    </CreateCopilotSafeProvider>
  );
}

export { CreateCopilotProvider, useCreateCopilot };
