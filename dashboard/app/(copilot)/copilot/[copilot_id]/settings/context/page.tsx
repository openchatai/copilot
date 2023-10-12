import React from "react";
import { Button } from "@/components/ui/button";
import { ContextPresetSelector } from "./_parts/ContextSelector";
import { contexts } from "./_parts/data/contexts";
import { HeaderShell } from "@/components/domain/HeaderShell";


export default function CopilotContextSettingsPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <HeaderShell className="items-center justify-between">
        <h1 className="text-lg font-bold text-secondary-foreground">Context</h1>
        <div className="space-x-2">
          <Button size="sm">Save</Button>
          <Button size="sm" variant="secondary">
            Cancel
          </Button>
        </div>
      </HeaderShell>

      <div className="flex-1 overflow-auto bg-accent/25 px-4 py-8">
        <div className="container max-w-screen-sm space-y-10">
          <ContextPresetSelector
            contexts={contexts}
            defaultContext={contexts[0]}
          />
        </div>
      </div>
    </div>
  );
}
