"use client";
import { CopilotType, getCopilot } from "@/data/copilot";
import { createSafeContext } from "@/lib/createSafeContext";
import { useParams } from "next/navigation";
import React from "react";
import useSwr, { mutate } from "swr";
import { CopilotNotFound } from "../_parts/CopilotNotFound";
import Loader from "@/components/ui/Loader";

const revalidateCopilot = (copilotId: string) => mutate(copilotId);

const [SafeCopilotProvider, useCopilot] = createSafeContext<CopilotType>(
  "[useCopilot] should be used within a CopilotProvider",
);

function CopilotProvider({ children }: { children: React.ReactNode }) {
  const { copilot_id } = useParams();
  const { isLoading, data: copilotData } = useSwr(copilot_id, getCopilot);
  if (isLoading) {
    return (
      <div className="flex-center h-full">
        <Loader />
      </div>
    );
  }
  if (copilotData) {
    return (
      <SafeCopilotProvider value={copilotData.data.chatbot}>
        {children}
      </SafeCopilotProvider>
    );
  } else {
    return <CopilotNotFound />;
  }
}

export { CopilotProvider, useCopilot, revalidateCopilot };
