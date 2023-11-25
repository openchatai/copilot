"use client";
import { createSafeContext } from "@/lib/createSafeContext";
import { cn } from "@/lib/utils";
import React, { forwardRef, useCallback, useState } from "react";

const [SafeProvider, useClosableDiv] = createSafeContext<{
  closed: boolean;
  close: () => void;
}>("ClosableDiv must be used inside ClosableDivProvider");

function ClosableDivProvider({ children }: { children: React.ReactNode }) {
  const [closed, setClosed] = useState(false);
  const close = useCallback(() => setClosed(true), []);
  return <SafeProvider value={{ closed, close }}>{children}</SafeProvider>;
}

const ClosableDiv = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, _ref) => {
  const { closed } = useClosableDiv();
  return (
    <div
      {...props}
      ref={_ref}
      hidden={closed}
      data-state={closed ? "closed" : "opened"}
      aria-hidden={closed}
      className={cn('data-[state=closed]:animate-out transition data-[state=opened]:animate-in data-[state=closed]:fade-out-0',className)}
    />
  );
});

ClosableDiv.displayName = "ClosableDiv";

const CloseBtn = forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<"button">
>(({ onClick, ...props }, _ref) => {
  const { closed, close } = useClosableDiv();
  return (
    <button
      {...props}
      ref={_ref}
      data-state={closed ? "closed" : "opened"}
      onClick={(ev) => {
        close();
        onClick?.(ev);
      }}
    />
  );
});

CloseBtn.displayName = "CloseBtn";

export { ClosableDiv, ClosableDivProvider, CloseBtn };
