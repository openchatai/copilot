import { CopilotType, ValidatorResponseType } from "@/data/copilot";
import { createSafeContext } from "@/lib/createSafeContext";
import React from "react";
import { produce } from "immer";
type State = {
  createdCopilot?: CopilotType;
  isLoading?: boolean;
  templateKey?: string;
  swaggerFiles?: File[];
  validatorResponse?: ValidatorResponseType;
};
const actionTypes = {
  ADD_SWAGGER: "ADD_SWAGGER",
  CHANGE_TEMPLATE_KEY: "CHANGE_TEMPLATE_KEY",
  SET_COPILOT: "SET_COPILOT",
  SET_LOADING: "SET_LOADING",
  SET_TEMPLATE: "SET_TEMPLATE",
  SET_VALIDATIONS: "SET_VALIDATIONS",
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
      type: ActionType["CHANGE_TEMPLATE_KEY"];
      payload: string | undefined;
    }
  | {
      type: ActionType["SET_VALIDATIONS"];
      payload: ValidatorResponseType;
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
      case actionTypes.CHANGE_TEMPLATE_KEY:
        draft.templateKey = action.payload;
        break;
      case actionTypes.SET_VALIDATIONS:
        draft.validatorResponse = action.payload;
        break;
    }
  });
}

function CreateCopilotProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, {
    isLoading: false,
    swaggerFiles: [],
    templateKey: undefined,
    createdCopilot: undefined,
    validatorResponse: undefined,
  });
  return (
    <CreateCopilotSafeProvider value={{ state, dispatch }}>
      {children}
    </CreateCopilotSafeProvider>
  );
}

export { CreateCopilotProvider, useCreateCopilot };
