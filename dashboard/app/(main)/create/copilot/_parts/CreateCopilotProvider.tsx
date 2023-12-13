import type { CopilotType } from "@/data/copilot";
import { createSafeContext } from "@/lib/createSafeContext";
import React from "react";
import { produce } from "immer";
import { FormValuesWithId } from "./swagger-form/types";

const Modes = ["CREATE_NEW_ENDPOINT", "EDIT_EXISTING_ENDPOINT"] as const;
type ModeType = typeof Modes[number];
type State = {
  createdCopilot?: CopilotType;
  isLoading?: boolean;
  swaggerFiles?: File[] | null;
  validatorResponse?: [];
  currentlyEditingEndpointId?: string | null;
  swaggerEndpoints: FormValuesWithId[];
  mode?: typeof Modes[number];
  copilot_name: string | null
};

const actionTypes = {
  ADD_SWAGGER: "ADD_SWAGGER",
  SET_COPILOT: "SET_COPILOT",
  SET_LOADING: "SET_LOADING",
  SET_TEMPLATE: "SET_TEMPLATE",
  SET_VALIDATIONS: "SET_VALIDATIONS",
  SET_SWAGGER_ENDPOINTS: "SET_SWAGGER_ENDPOINTS",
  DELETE_SWAGGER_ENDPOINT: "DELETE_SWAGGER_ENDPOINT",
  ADD_NEW_ENDPOINT: "ADD_NEW_ENDPOINT",
  SET_EDIT_MODE: "SET_EDIT_MODE",
  RESET_MODE: "RESET_MODE",
  CHANGE_NAME: "CHANGE_NAME",
} as const;

type ActionType = typeof actionTypes;

type Action =
  | {
    type: ActionType["SET_COPILOT"];
    payload: CopilotType;
  }
  | {
    type: ActionType["SET_LOADING"];
    payload: boolean;
  }
  | {
    type: ActionType["ADD_SWAGGER"];
    payload: File[] | null;
  }
  | {
    type: ActionType["SET_SWAGGER_ENDPOINTS"];
    payload: FormValuesWithId[];
  } | {
    type: ActionType["DELETE_SWAGGER_ENDPOINT"];
    payload: string;
  } | {
    type: ActionType['ADD_NEW_ENDPOINT'],
    payload: FormValuesWithId
  } | {
    type: "CHANGE_MODE",
    payload: {
      mode?: ModeType,
      endpointId?: string
    }

  } | {
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
      case actionTypes.SET_LOADING:
        draft.isLoading = action.payload;
        break;
      case actionTypes.ADD_SWAGGER:
        draft.swaggerFiles = action.payload;
        break;
      case actionTypes.SET_SWAGGER_ENDPOINTS:
        draft.swaggerEndpoints = action.payload;
        break;
      case actionTypes.DELETE_SWAGGER_ENDPOINT:
        draft.swaggerEndpoints = draft.swaggerEndpoints.filter((endpoint) => endpoint.id !== action.payload);
        break;
      case actionTypes.ADD_NEW_ENDPOINT:
        draft.swaggerEndpoints.push(action.payload);
        break;
      case "CHANGE_NAME":
        draft.copilot_name = action.payload;
        break;
      case "CHANGE_MODE":
        draft.mode = action.payload.mode;
        draft.currentlyEditingEndpointId = action.payload.endpointId;
        break;
    }
  });
}

function CreateCopilotProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, {
    isLoading: false,
    swaggerFiles: [],
    createdCopilot: undefined,
    validatorResponse: undefined,
    currentlyEditingEndpointId: null,
    swaggerEndpoints: [],
    copilot_name: null

  });
  return (
    <CreateCopilotSafeProvider value={{ state, dispatch }}>
      {children}
    </CreateCopilotSafeProvider>
  );
}

export { CreateCopilotProvider, useCreateCopilot };
