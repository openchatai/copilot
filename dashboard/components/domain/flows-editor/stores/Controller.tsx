'use client';
import { useReducer, type ReactNode } from "react";
import { produce } from "immer";
import { NodeData, TransformedPath } from "../types/Swagger";
import { ReactFlowProvider } from "reactflow";
import { Settings, SettingsProvider } from "./Config";
import { createSafeContext } from "@/lib/createSafeContext";

type StateShape = {
  paths: TransformedPath[];
  steps: NodeData[];
  name: string | null;
  description: string | null;
};

type ControllerContextType = {
  loadPaths: (paths: TransformedPath[]) => void;
  state: StateShape;
  reset: () => void;
  appendNode: (node: NodeData) => void;
  addNodeBetween: (sourceId: string, targetId: string, node: NodeData) => void;
  deleteNode: (id: string) => void;
  setData: (data: Omit<StateShape, 'paths'>) => void;
};

type ActionType =
  | { type: "reset" }
  | { type: "load-paths"; pyload: TransformedPath[] }
  | {
    type: "append-node",
    payload: {
      node: NodeData
    }
  } | {
    type: "delete-node",
    payload: string
  } | {
    type: "add-node-between",
    payload: {
      sourceId: string,
      targetId: string,
      node: NodeData
    }
  } | {
    type: "set-data",
    payload: Omit<StateShape, 'paths'>
  };


const initialStateValue: StateShape = {
  paths: [],
  description: null,
  name: null,
  steps: [],
};
const [SafeProvider, useController] =
  createSafeContext<ControllerContextType>("");

function stateReducer(state: StateShape, action: ActionType) {
  if (action.type === "reset") return {
    ...initialStateValue,
    paths: state.paths,
  };
  return produce(state, (draft) => {
    switch (action.type) {
      case "load-paths":
        draft.paths = action.pyload;
        break;
      case "append-node": {
        draft.steps.push(action.payload.node);
        break;
      }
      case "delete-node": {
        draft.steps = draft.steps.filter((node) => node.id !== action.payload);
        break;
      }
      case "add-node-between": {
        const { targetId, node } = action.payload;
        const index = draft.steps.findIndex((s) => s.id === targetId);
        draft.steps.splice(index + 1, 0, node);
        break;
      }
      case "set-data": {
        const { name, description, steps } = action.payload;
        draft.name = name;
        draft.description = description;
        draft.steps = steps;
        break;
      }
      default:
        break;
    }
  });
}

function Controller({
  children,
  onChange,
  initialState,
  ...settings
}: {
  children: ReactNode;
  initialState?: StateShape;
  onChange?: (state: StateShape) => void;
} & Settings) {
  const [state, dispatch] = useReducer(
    stateReducer,
    initialState ? initialState : initialStateValue,
  );

  return (
    <ReactFlowProvider>
      <SettingsProvider value={settings}>
        <SafeProvider
          value={{
            state,
            reset() {
              dispatch({ type: "reset" });
            },
            loadPaths(paths) {
              dispatch({ type: "load-paths", pyload: paths });
            },
            addNodeBetween(sourceId, targetId, node) {
              dispatch({
                type: "add-node-between",
                payload: {
                  sourceId,
                  targetId,
                  node,
                },
              });
            },
            appendNode(node) {
              dispatch({
                type: "append-node",
                payload: {
                  node,
                },
              });
            },
            deleteNode(id) {
              dispatch({
                type: "delete-node",
                payload: id,
              });
            },
            setData(data) {
              dispatch({
                type: "set-data",
                payload: data,
              });
            },
          }}
        >
          {children}
        </SafeProvider>
      </SettingsProvider>
    </ReactFlowProvider>
  );
}

export { useController, Controller };