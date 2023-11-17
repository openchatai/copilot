import React from "react";
import { HeaderShell } from "@/components/domain/HeaderShell";

export function ConversationHeader() {
  return (
    <HeaderShell className="items-center justify-between">
      <h1 className="max-w-md flex-1 text-start text-base font-semibold text-secondary-foreground">
        Conversation
      </h1>
    </HeaderShell>
  );
}
