import React, { ReactNode } from "react";
import { Header } from "@/ui/partials/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex h-[100dvh] overflow-hidden">
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header />
          <main className="w-full grow">{children}</main>
        </div>
      </div>
    </>
  );
}
