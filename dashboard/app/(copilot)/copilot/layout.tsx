import { HeaderShell } from "@/app/(main)/parts/Header";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function CopilotLayout({ children }: Props) {
  return (
    <div className="flex">
      <aside className="h-full w-header shrink-0 border-r border-border flex flex-col justify-between items-stretch">
        <div className="h-header border-b border-border">t</div>
        <div className="flex-1 overflow-y-auto overflow-hidden">m</div>
        <div>b</div>
      </aside>
      <main className="flex-1 flex flex-col">
        <HeaderShell></HeaderShell>
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
