"use client";
import { createSafeContext } from "@/lib/createSafeContext";
import React from "react";
import { CardTypes } from "./data";
import { produce } from "immer";

const [SafeProvider, useCreateCopilot] = createSafeContext<{
  state: State;
  dispatch: React.Dispatch<Actions>;
}>("CreateCopilotProvider");
// actions type
type State = {
  selectedTemplate: CardTypes | null;
};

type Actions =
  | {
      type: "SELECT_TEMPLATE";
      payload: CardTypes;
    }
  | {
      type: "RESET_TEMPLATE";
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
      default:
        break;
    }
  });
}

function CreateCopilotProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducerFunction, {
    selectedTemplate: null,
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
