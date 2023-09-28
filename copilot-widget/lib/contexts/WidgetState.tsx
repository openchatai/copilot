import { ReactNode, createContext, useContext } from "react";
import useToggle from "../hooks/useToggle";

const StateContext = createContext<ReturnType<typeof useToggle> | undefined>(
  undefined
);
export function useWidgetStateContext(): ReturnType<typeof useToggle> {
  const context = useContext(StateContext);

  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
}

export default function WidgetState({ children }: { children: ReactNode }) {
  const data = useToggle(false)
  return <StateContext.Provider value={data}>{children}</StateContext.Provider>;
}
