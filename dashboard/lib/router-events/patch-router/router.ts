import { useRouter as useRouterOriginal } from "next/navigation";
import { onStart } from "../events";
import { shouldTriggerStartEvent } from "./should-trigger-start-event";

export function useRouter(): ReturnType<typeof useRouterOriginal> {
  const router = useRouterOriginal();
  return {
    ...router,
    push: (href, options) => {
      if (shouldTriggerStartEvent(href)) onStart();
      router.push(href, options);
    },
    replace: (href, options) => {
      if (shouldTriggerStartEvent(href)) onStart();
      router.replace(href, options);
    },
  };
}
