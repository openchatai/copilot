import { type Edge, type Node } from "reactflow";
import React, { useCallback, useMemo } from "react";
import { atom, useAtom } from "jotai";

export type Mode =
  | AppendNodeMode
  | AddNodeBetweenMode
  | EditNodeMode
  | IdleMode;

const DEFAULT: Mode = { type: "append-node" };

export const modeAtom = atom<Mode>(DEFAULT);

type IdleMode = {
  type: "idle";
};
type AppendNodeMode = {
  type: "append-node";
};
type AddNodeBetweenMode = {
  type: "add-node-between";
  edge: Edge;
};
type EditNodeMode = {
  type: "edit-node";
  nodeId: string;
};

type ModeContextType = {
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  reset: () => void;
  isAdd: boolean;
  isEdit: boolean;
  isIdle: boolean;
};
function useMode(): ModeContextType {
  const [mode, setMode] = useAtom(modeAtom);
  const reset = useCallback(() => setMode(DEFAULT), [setMode]);
  const isAdd = useMemo(
    () => mode.type === "append-node" || mode.type === "add-node-between",
    [mode],
  );
  const isIdle = useMemo(() => mode.type === "idle", [mode]);
  const isEdit = useMemo(() => mode.type === "edit-node", [mode]);

  return {
    mode,
    setMode,
    reset,
    isAdd,
    isEdit,
    isIdle,
  };
}

export { useMode };