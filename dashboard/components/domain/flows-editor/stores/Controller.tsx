import {
  useReducer,
  type ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { produce } from "immer";
import { NodeData, TransformedPath } from "../types/Swagger";
import { ReactFlowProvider } from "reactflow";
import { FlowType } from "../types/Flow";
import { Settings, SettingsProvider } from "./Config";
import { getDef } from "../utils/getDef";
import { createSafeContext } from "@/lib/createSafeContext";
import genId from 'lodash/uniqueId'

type StateShape = {
  paths: TransformedPath[];
  activeFlowId?: string;
  flows: FlowType[];
};

type ControllerContextType = {
  loadPaths: (paths: TransformedPath[]) => void;
  state: StateShape;
  activeNodes?: NodeData[];
  createFlow: (data: CreateFlowPayload) => void;
  setActiveFlow: (id: string) => void;
  reset: () => void;
  deleteFlow: (id: string) => void;
  getData: () => ReturnType<typeof getDef>;
  loadData: (data: ReturnType<typeof getDef>) => void;
  appendNode: (node: NodeData) => void;
  addNodeBetween: (sourceId: string, targetId: string, node: NodeData) => void;
  deleteNode: (id: string) => void;
};

type ActionType =
  | { type: "reset" }
  | { type: "load-paths"; pyload: TransformedPath[] }
  | { type: "set-active-flow"; pyload: string }
  | {
    type: "create-flow";
    pyload: {
      name: string;
      description?: string;
      createdAt?: number;
      focus: boolean;
    };
  }
  | {
    type: "delete-flow";
    pyload: string;
  }
  | { type: "set-flows"; pyload: StateShape["flows"] }
  | { type: "load-data"; payload: ReturnType<typeof getDef> } |
  {
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
  }

type CreateFlowPayload = Extract<ActionType, { type: "create-flow" }>["pyload"];

const initialStateValue: StateShape = {
  paths: [],
  flows: [],
  activeFlowId: undefined,
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
      case "set-active-flow":
        draft.activeFlowId = action.pyload;
        break;
      case "create-flow": {
        const id = genId();
        const $newFlow = {
          steps: [],
          id,
          ...action.pyload,
        };
        draft.flows.push($newFlow);
        if (action.pyload.focus) draft.activeFlowId = id;
        break;
      }
      case "delete-flow":
        draft.flows = draft.flows.filter((f) => f.id !== action.pyload);
        if (draft.activeFlowId === action.pyload) {
          draft.activeFlowId = undefined;
        }
        break;
      case "append-node": {
        if (!draft.activeFlowId) return;
        const flow = draft.flows.find((f) => f.id === draft.activeFlowId);
        if (!flow) return;
        flow.steps.push(action.payload.node);
        break;
      }
      case "delete-node": {
        if (!draft.activeFlowId) return;
        const flow = draft.flows.find((f) => f.id === draft.activeFlowId);
        if (!flow) return;
        flow.steps = flow.steps.filter((s) => s.id !== action.payload);
        break;
      }
      case "add-node-between": {
        if (!draft.activeFlowId) return;
        const flow = draft.flows.find((f) => f.id === draft.activeFlowId);
        if (!flow) return;
        const { targetId, node } = action.payload;
        // add after targetId
        const index = flow.steps.findIndex((s) => s.id === targetId);
        flow.steps.splice(index + 1, 0, node);
        break;
      }
      case "load-data": {
        const { flows } = action.payload;
        draft.flows = flows;
        draft.activeFlowId = flows[0]?.id;
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

  useEffect(() => {
    onChange?.(state);
  }, [state, onChange]);

  const loadPaths = useCallback(
    (paths: TransformedPath[]) =>
      dispatch({
        type: "load-paths",
        pyload: paths,
      }),
    [],
  );
  const createFlow = useCallback((data: CreateFlowPayload) => {
    if (settings.maxFlows && state.flows.length >= settings.maxFlows) return;
    dispatch({
      type: "create-flow",
      pyload: data,
    });
  }, []);
  const setActiveFlow = useCallback(
    (id: string) =>
      dispatch({
        type: "set-active-flow",
        pyload: id,
      }),
    [],
  );
  const activeNodes = useMemo(() => {
    if (!state.activeFlowId) return undefined;
    const flow = state.flows.find((f) => f.id === state.activeFlowId);
    if (!flow) return undefined;
    return flow.steps;
  }, [state]);

  const deleteFlow = useCallback(
    (id: string) =>
      dispatch({
        type: "delete-flow",
        pyload: id,
      }),
    [],
  );
  // TODO: @bug: when we reset, the nodes(in the arena) are not reset
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const getData = useCallback(() => getDef(state.flows), [state]);
  const appendNode = useCallback(
    (node: NodeData) =>
      dispatch({
        type: "append-node",
        payload: {
          node,
        },
      }),
    [],
  );
  const addNodeBetween = useCallback(
    (sourceId: string, targetId: string, node: NodeData) =>
      dispatch({
        type: "add-node-between",
        payload: {
          sourceId,
          targetId,
          node,
        },
      }),
    [],
  );
  const deleteNode = useCallback(
    (id: string) =>
      dispatch({
        type: "delete-node",
        payload: id,
      }),
    [],
  );
  const loadData = useCallback(
    (data: ReturnType<typeof getDef>) =>
      dispatch({
        type: "load-data",
        payload: data,
      }),
    [],
  );
  return (
    <ReactFlowProvider>
      <SettingsProvider value={settings}>
        <SafeProvider
          value={{
            loadPaths,
            addNodeBetween,
            state,
            createFlow,
            setActiveFlow,
            activeNodes,
            appendNode,
            deleteFlow,
            reset,
            deleteNode,
            getData,
            loadData,
          }}
        >
          {children}
        </SafeProvider>
      </SettingsProvider>
    </ReactFlowProvider>
  );
}

export { useController, Controller };