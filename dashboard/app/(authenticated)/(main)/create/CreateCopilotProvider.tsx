"use client";
import { createSafeContext } from "@/lib/createSafeContext";
import React from "react";

const [SafeProvider, useCreateCopilot] = createSafeContext(
  "CreateCopilotProvider",
);
function CreateCopilotProvider({ children }: { children: React.ReactNode }) {
  return <SafeProvider value={{}}>{children}</SafeProvider>;
}
export { useCreateCopilot, CreateCopilotProvider };
