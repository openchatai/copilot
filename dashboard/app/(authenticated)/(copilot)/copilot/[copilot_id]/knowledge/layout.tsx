import { HeaderShell } from "@/components/domain/HeaderShell";
import { Library, Link2 } from "lucide-react";
import React from "react";
import { SearchBox } from "./_parts/SearchBox";
import { AddDataSource } from "./_parts/AddDataSource";
import { Link } from "@/lib/router-events";
import { SubNavLink } from "../../../_parts/SubNavLink";
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
            <Link
              href="https://docs.opencopilot.so/"
              target="_blank"
              className="flex items-center rounded-md border-gray-300 border px-3 py-2 text-sm text-accent-foreground transition duration-150 ease-in-out"
            >
              <Link2 className="mr-2 h-5 w-5" />
              Docs
            </Link>
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
        <div className="w-full flex-1 overflow-auto bg-accent/25 relative">
          {children}
        </div>
      </div>
    </div>
  );
}
