import React from "react";
import Image from "next/image";
type Props = {
  Imagesize?: number;
  children?: React.ReactNode;
};

export function EmptyBlock({ Imagesize = 60, children }: Props) {
  return (
    <div className="flex-center flex-col gap-2 py-4 animate-in fade-in">
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
