import React from "react";

export function KBD({ children }: { children: React.ReactNode }) {
  return <kbd className="pointer-events-none h-6 aspect-square border-stone-300 [&_+_kbd]:ms-0.5 dark:border-stone-700 select-none rounded border font-mono text-[10px] font-medium opacity-100 leading-[2em] shadow inline-block text-center p-0.5">{children}</kbd>;
}
