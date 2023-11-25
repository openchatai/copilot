import React, { createContext, useContext } from "react";
/**
 * Creates a context with a custom error message
 * @param errorMessage - The error message to throw if the context is null
 * @returns A tuple containing the Provider and the useSafeContext hook
 * @example
 * const [Provider, useSafeContext] = createSafeContext("Context is null");
 * */
export function createSafeContext<ContextValue>(errorMessage: string) {
  const Context = createContext<ContextValue>({} as ContextValue);

  const useSafeContext = () => {
    const ctx = useContext(Context);

    if (ctx === null) {
      throw new Error(errorMessage);
    }

    return ctx;
  };

  const Provider = ({
    children,
    value,
  }: {
    value: ContextValue;
    children: React.ReactNode;
  }) => <Context.Provider value={value}>{children}</Context.Provider>;

  return [Provider, useSafeContext] as const;
}
