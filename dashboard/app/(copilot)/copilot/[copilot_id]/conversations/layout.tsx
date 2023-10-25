import { HeaderShell } from "@/components/domain/HeaderShell";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import React from "react";

type Props = {
  children: React.ReactNode;
  params: {
    copilot_id: string;
  };
};

export default function SettingsLayout({ children, params }: Props) {
  const copilotBase = `/copilot/${params.copilot_id}/conversations`;
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <HeaderShell className="justify-between">
        <h1 className="text-lg font-bold text-secondary-foreground">
          Conversations
        </h1>
        <Button size="icon" variant="secondary" className="hidden">
          <RefreshCcw className="h-6 w-6" />
        </Button>
      </HeaderShell>
      <div className="h-full flex-1 overflow-auto">{children}</div>
    </div>
  );
}
