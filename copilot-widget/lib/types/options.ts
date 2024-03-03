import type { LangType } from "@lib/locales";

export type Options = {
  token: string;
  headers?: Record<string, string>;
  initialMessage: string;
  triggerSelector: string;
  apiUrl: string;
  socketUrl: string;
  defaultOpen?: boolean;
  language?: LangType;
  warnBeforeClose?: boolean;
  containerProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  user?: {
    name?: string;
    avatarUrl?: string;
  };
  bot?: {
    name?: string;
    avatarUrl?: string;
  };
};
