"use client";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type ReactNode, forwardRef } from "react";
import cn from "../utils/cn";

const TooltipTrigger = TooltipPrimitive.Trigger;

function Tooltip({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>{children}</TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
Tooltip.displayName = "ToolTip";
const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    arrowClassName?: string;
  }
>(({ className, children, sideOffset = 0, arrowClassName, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    dir="auto"
    className={cn(
      "opencopilot-text-primary opencopilot-font-medium opencopilot-px-2 opencopilot-bg-accent opencopilot-z-[50000] opencopilot-py-1 opencopilot-overflow-hidden opencopilot-shadow opencopilot-min-w-fit opencopilot-max-w-[15rem] opencopilot-select-none opencopilot-rounded-sm opencopilot-p-0.5 opencopilot-text-xs opencopilot-leading-none",
      "opencopilot-animate-in opencopilot-fade-in-0 opencopilot-slide-in-from-bottom-5 data-[state=closed]:animate-out data-[state=closed]:opencopilot-slide-in-from-top-0",
      className
    )}
    {...props}
  >
    <>
      {children}
      <TooltipPrimitive.Arrow
        className={cn(
          "opencopilot-fill-current opencopilot-text-accent opencopilot-animate-in opencopilot-slide-in-from-top-1 opencopilot-ease-out data-[state=closed]:opencopilot-animate-out",
          arrowClassName
        )}
      />
    </>
  </TooltipPrimitive.Content>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent };
