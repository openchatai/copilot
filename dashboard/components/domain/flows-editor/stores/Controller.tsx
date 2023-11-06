import {
  useReducer,
  type ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { produce } from "immer";
import { Node } from "reactflow";
import { ModeProvider } from "./ModeProvider";
import { TransformedPath } from "../types/Swagger";
import { genId } from "../utils";
import { ReactFlowProvider } from "reactflow";
import { EndpointNodeType, Flow, FlowType } from "../types/Flow";
import { Settings, SettingsProvider } from "./Config";
import { getDef } from "../utils/getDef";
import { createSafeContext } from "@/lib/createSafeContext";
import { transformaEndpointToNode } from "..";

type StateShape = {
  paths: TransformedPath[];
  activeFlowId?: string;
  flows: FlowType[];
};

type ControllerContextType = {
  loadPaths: (paths: TransformedPath[]) => void;
  state: StateShape;
  activeNodes?: EndpointNodeType[];
  createFlow: (data: CreateFlowPayload) => void;
  setActiveFlow: (id: string) => void;
  setNodes: (nodes: Node[]) => void;
  reset: () => void;
  deleteFlow: (id: string) => void;
  getData: () => ReturnType<typeof getDef>;
  loadFlows: (data: Flow[]) => void;
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
  | { type: "set-nodes"; payload: Node[] }
  | { type: "load-flows"; payload: Flow[] };

type CreateFlowPayload = Extract<ActionType, { type: "create-flow" }>["pyload"];

const initialStateValue: StateShape = {
  paths: [],
  flows: [],
  activeFlowId: undefined,
};
const [SafeProvider, useController] =
  createSafeContext<ControllerContextType>("");
function stateReducer(state: StateShape, action: ActionType) {
  if (action.type === "reset") return initialStateValue;
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
      case "set-nodes":
        {
          const flow = draft.flows.find((f) => f.id === state.activeFlowId);
          if (!flow) return;
          flow.steps = action.payload;
          flow.updatedAt = Date.now();
        }
        break;
      case "delete-flow":
        draft.flows = draft.flows.filter((f) => f.id !== action.pyload);
        if (draft.activeFlowId === action.pyload) {
          draft.activeFlowId = undefined;
        }
        break;
      case "load-flows": {
        const id = genId();
        if (action.payload) {
          draft.flows = action.payload.map((f) => ({
            ...f,
            id,
            name: f.name,
            description: f.description,
            // @ts-ignore
            steps: transformaEndpointToNode(f.steps),
          }));
          draft.activeFlowId = id;
        }
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

  const setNodes = useCallback(
    (nodes: Node[]) =>
      dispatch({
        type: "set-nodes",
        payload: nodes,
      }),
    [],
  );
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
  const loadFlows = useCallback(
    (data: Flow[]) =>
      dispatch({
        type: "load-flows",
        payload: data,
      }),
    [],
  );
  return (
    <ReactFlowProvider>
      <SettingsProvider value={settings}>
        <ModeProvider>
          <SafeProvider
            value={{
              loadPaths,
              state,
              createFlow,
              setActiveFlow,
              activeNodes,
              setNodes,
              deleteFlow,
              reset,
              getData,
              loadFlows,
            }}
          >
            {children}
          </SafeProvider>
        </ModeProvider>
      </SettingsProvider>
    </ReactFlowProvider>
  );
}

export { useController, Controller };
