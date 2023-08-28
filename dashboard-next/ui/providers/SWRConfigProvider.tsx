"use client";
import React from "react";
import { SWRConfig } from "swr";

export function SWRConfigProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        keepPreviousData: true,
        dedupingInterval: 1000 * 10,
      }}
    >
      {children}
    </SWRConfig>
  );
}
