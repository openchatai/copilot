import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
type Props = {
  Imagesize?: number;
  children?: React.ReactNode;
  className?: string;
};

export function EmptyBlock({ Imagesize = 60, children, className }: Props) {
  return (
    <div className={cn("flex-center flex-col gap-2 py-4 animate-in fade-in", className)}>
      <Image
        src="/random_icons_2.svg"
        width={Imagesize}
        height={Imagesize}
        alt="Empty Icon"
        className="aspect-square"
      />
      {children}
    </div>
  );
}
