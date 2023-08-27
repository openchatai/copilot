export type Options = {
    token: string;
    headers: Record<string, string>;
    initialMessages: Array<string>;
    triggerSelector: string;
    fixed?: boolean;
    apiUrl: string;
};
