export type Options = {
  token: string;
  headers?: Record<string, string>;
  initialMessage: string;
  triggerSelector: string;
  apiUrl: string;
  defaultOpen?: boolean;
  user?: {
    name?: string;
  };
};
