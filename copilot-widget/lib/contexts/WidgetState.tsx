import type { ReactNode } from "react";
import { useToggle } from "@lib/hooks";
import { useConfigData } from "./ConfigData";
import { createSafeContext } from "./createSafeContext";

type StateContextType = ReturnType<typeof useToggle>;

const [useWidgetState, WidgetStateSafeProvider] =
  createSafeContext<StateContextType>();

export function WidgetState({ children }: { children: ReactNode }) {
  const { defaultOpen } = useConfigData();
  const data = useToggle(defaultOpen ?? false);

  return (
    <WidgetStateSafeProvider value={data}>{children}</WidgetStateSafeProvider>
  );
}

export { useWidgetState };
