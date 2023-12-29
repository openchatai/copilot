import type { ReactNode } from "react";
import useToggle from "../hooks/useToggle";
import { useConfigData } from "./ConfigData";
import { createSafeContext } from "./create-safe-context";

type StateContextType = ReturnType<typeof useToggle>

const [
  useWidgetState,
  WidgetStateSafeProvider,
] = createSafeContext<StateContextType>()

export default function WidgetState({ children }: { children: ReactNode }) {
  const { defaultOpen } = useConfigData()
  const data = useToggle(defaultOpen ?? false)
  return <WidgetStateSafeProvider value={data}>{children}</WidgetStateSafeProvider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export { useWidgetState }