import React from "react";

export function HeaderShell({ children }: { children: React.ReactNode }) {
  return (
    <header className="h-header w-full border-b shrink-0 border-border flex flex-row">
      {children}
    </header>
  );
}
