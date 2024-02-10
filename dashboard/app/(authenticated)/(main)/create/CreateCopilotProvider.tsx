"use client";
import { createSafeContext } from "@/lib/createSafeContext";
import React from "react";
import { CardTypes } from "./data";
import { produce } from "immer";
import { CopilotType } from "@/data/copilot";

const [SafeProvider, useCreateCopilot] = createSafeContext<{
  state: State;
  dispatch: React.Dispatch<Actions>;
}>("CreateCopilotProvider");
// actions type
type State = {
  selectedTemplate: CardTypes | null;
  copilot_name: string;
  createdCopilot: null | CopilotType;
};

type Actions =
  | {
      type: "SELECT_TEMPLATE";
      payload: CardTypes;
    }
  | {
      type: "RESET_TEMPLATE";
    }
  | {
      type: "CHANGE_NAME";
      payload: string;
    }
  | {
      type: "SET_COPILOT";
      payload: CopilotType;
    };

function reducerFunction(state: State, action: Actions) {
  return produce(state, (draft: State) => {
    switch (action.type) {
      case "SELECT_TEMPLATE":
        draft.selectedTemplate = action.payload;
        break;
      case "RESET_TEMPLATE":
        draft.selectedTemplate = null;
        break;
      case "CHANGE_NAME":
        draft.copilot_name = action.payload;
        break;
      case "SET_COPILOT":
        draft.createdCopilot = action.payload;
        break;
      default:
        break;
    }
  });
}

function CreateCopilotProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducerFunction, {
    selectedTemplate: "copilot",
    copilot_name: "",
    createdCopilot: null,
  });

  return (
    <SafeProvider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </SafeProvider>
  );
}
export { useCreateCopilot, CreateCopilotProvider };
