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
  containerProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  user?: {
    name?: string;
  };
};
