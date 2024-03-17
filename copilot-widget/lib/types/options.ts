import type { HandoffPayloadType } from "./messageTypes";
import type { LangType } from "@lib/locales";
import type { ComponentType } from "./components";

export type Options = {
  token: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  initialMessage: string;
  triggerSelector: string;
  apiUrl: string;
  socketUrl: string;
  defaultOpen?: boolean;
  debug?: boolean;
  language?: LangType;
  warnBeforeClose?: boolean;
  onClose?: () => void;
  onHandoff?: (handout: HandoffPayloadType) => void;
  containerProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  components?: ComponentType[];
  user?: {
    name?: string;
    avatarUrl?: string;
  };
  bot?: {
    name?: string;
    avatarUrl?: string;
  };
};
