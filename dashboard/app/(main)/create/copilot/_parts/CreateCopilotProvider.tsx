import { CopilotType, ValidatorResponseType } from "@/data/copilot";
import { createSafeContext } from "@/lib/createSafeContext";
import React from "react";
import { produce } from "immer";
import { FormValuesWithId } from "./swagger-form/types";
type State = {
  createdCopilot?: CopilotType;
  isLoading?: boolean;
  swaggerFiles?: File[];
  validatorResponse?: ValidatorResponseType;
  currentlyEditingEndpointId?: string | null;
  swaggerEndpoints: FormValuesWithId[]
};
const actionTypes = {
  ADD_SWAGGER: "ADD_SWAGGER",
  CHANGE_TEMPLATE_KEY: "CHANGE_TEMPLATE_KEY",
  SET_COPILOT: "SET_COPILOT",
  SET_LOADING: "SET_LOADING",
  SET_TEMPLATE: "SET_TEMPLATE",
  SET_VALIDATIONS: "SET_VALIDATIONS",
  SET_CURRENTLY_EDITING_ENDPOINT_ID: "SET_CURRENTLY_EDITING_ENDPOINT_ID",
  SET_SWAGGER_ENDPOINTS: "SET_SWAGGER_ENDPOINTS",
  DELETE_SWAGGER_ENDPOINT: "DELETE_SWAGGER_ENDPOINT"
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
    payload: File[];
  }
  | {
    type: ActionType["SET_VALIDATIONS"];
    payload: ValidatorResponseType;
  } | {
    type: ActionType["SET_CURRENTLY_EDITING_ENDPOINT_ID"];
    payload: string | null;
  } | {
    type: ActionType["SET_SWAGGER_ENDPOINTS"];
    payload: FormValuesWithId[];
  } | {
    type: ActionType["DELETE_SWAGGER_ENDPOINT"];
    payload: string;
  } | {
    type: "ADD_NEW_ENDPOINT",
  };
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
      case actionTypes.SET_VALIDATIONS:
        draft.validatorResponse = action.payload;
        break;
      case actionTypes.SET_CURRENTLY_EDITING_ENDPOINT_ID:
        draft.currentlyEditingEndpointId = action.payload;
        break;
      case actionTypes.SET_SWAGGER_ENDPOINTS:
        draft.swaggerEndpoints = action.payload;
        break;
      case actionTypes.DELETE_SWAGGER_ENDPOINT:
        draft.swaggerEndpoints = draft.swaggerEndpoints.filter((endpoint) => endpoint.id !== action.payload);
        break;
      case "ADD_NEW_ENDPOINT":
        draft.swaggerEndpoints.push({
          id: Math.random().toString(),
          method: "GET",
          title: "New Endpoint",
          url: "",
          headers: [],
          parameters: [],
          summary: "",
        });
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
    swaggerEndpoints: [{
      id: Math.random().toString(),
      method: "GET",
      title: "get users",
      url: "https://api.example.com/v1/users",
      headers: [],
      parameters: [],
      summary: "",
    }]
  });
  return (
    <CreateCopilotSafeProvider value={{ state, dispatch }}>
      {children}
    </CreateCopilotSafeProvider>
  );
}

export { CreateCopilotProvider, useCreateCopilot };
