import React from "react";
import { SearchModal } from "./(main)/_parts/SearchModal";
import { Tv2 } from "lucide-react";
type Props = {
  children: React.ReactNode;
};

export default async function AuthenticatedLayout({ children }: Props) {
  return (
    <>
      <div className="fixed inset-0 z-[500] flex items-center justify-center bg-primary-foreground/70 p-5 backdrop-blur md:!hidden">
        <div className="flex flex-col items-center justify-center text-lg">
          <span>
            <Tv2 className="h-20 w-20 text-primary" />
          </span>
          <h2 className="font-semibold">Your browser is too small</h2>
          <p className="text-base font-medium">
            Resize your browser to at least 900px wide to continue.
          </p>
        </div>
      </div>
      {children}
      <SearchModal />
    </>
  );
}
