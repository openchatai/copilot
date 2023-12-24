export type Options = {
  token: string;
  headers?: Record<string, string>;
  initialMessage: string;
  triggerSelector: string;
  apiUrl: string;
  defaultOpen?: boolean;
  containerProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  user?: {
    name?: string;
  };
};
