import { BrainCircuit, Settings2 } from "lucide-react";
import React from "react";
import { SubNavLink } from "../../../_parts/SubNavLink";

type Props = {
  children: React.ReactNode;
  params: {
    copilot_id: string;
  };
};

export default function SettingsLayout({ children, params }: Props) {
  const copilotBase = `/copilot/${params.copilot_id}/settings`;
  return (
    <div className="flex h-full flex-row overflow-hidden">
      <div className="h-full w-aside shrink-0 border-r bg-primary-foreground">
        <div className="flex-center h-header justify-start border-b px-6 bg-white">
          <h1 className="text-lg font-bold text-secondary-foreground">
            Settings
          </h1>
        </div>
        <div className="p-4">
          <ul className="space-y-1">
            <SubNavLink href={copilotBase} Icon={Settings2} label="General" />
            <SubNavLink
              href={copilotBase + "/context"}
              Icon={BrainCircuit}
              label="Context"
            />
          </ul>
        </div>
      </div>
      <div className="h-full flex-1 overflow-auto">{children}</div>
    </div>
  );
}
