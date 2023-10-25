import React from "react";
import Aside from "./_parts/Aside";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full">
      <Aside />
      <main className="w-full flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
