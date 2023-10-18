"use client";
import { CopilotType, getCopilot } from "@/data/copilot";
import { createSafeContext } from "@/lib/createSafeContext";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import useSwr from "swr";
const [SafeCopilotProvider, useCopilot] = createSafeContext<CopilotType>(
  "[useCopilot] should be used within a CopilotProvider",
);

function CopilotProvider({ children }: { children: React.ReactNode }) {
  const { copilot_id } = useParams();
  const [copilotData, setCopilotData] = useState<CopilotType>();
  //   check if copilot_id exists in the database

  const { isLoading, data } = useSwr(copilot_id, getCopilot);
  if (copilotData) {
    return (
      <SafeCopilotProvider value={copilotData}>{children}</SafeCopilotProvider>
    );
  } else {
    return <div>copilot not found</div>;
  }
}

export { CopilotProvider, useCopilot };
