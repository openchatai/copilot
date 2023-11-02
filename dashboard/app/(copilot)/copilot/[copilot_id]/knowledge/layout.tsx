import { SubNavLink } from "@/app/(copilot)/_parts/SubNavLink";
import { HeaderShell } from "@/components/domain/HeaderShell";
import { Library } from "lucide-react";
import React from "react";
import { SearchBox } from "./_parts/SearchBox";
import { AddDataSource } from "./_parts/AddDataSource";
type Props = {
  children: React.ReactNode;
  params: {
    copilot_id: string;
  };
};

export default function KnowledgeLayout({ children, params }: Props) {
  const copilotBase = `/copilot/${params.copilot_id}/knowledge`;

  return (
    <div className="flex h-full flex-row overflow-hidden">
      <div className="h-full w-aside shrink-0 border-r bg-primary-foreground">
        <div className="flex-center h-header justify-start border-b px-6">
          <h1 className="text-lg font-bold text-secondary-foreground">
            Knowledge Base
          </h1>
        </div>
        <div className="p-4">
          <ul className="space-y-1">
            <SubNavLink
              href={copilotBase}
              Icon={Library}
              label="Data Sources"
            />
          </ul>
        </div>
      </div>
      <div className="flex h-full flex-1 flex-col overflow-auto">
        <HeaderShell className="flex justify-between gap-5">
          <SearchBox />
          <div className="space-x-2">
            <AddDataSource />
          </div>
        </HeaderShell>
        <div className="w-full flex-1 overflow-auto bg-accent/25">
          {children}
        </div>
      </div>
    </div>
  );
}
