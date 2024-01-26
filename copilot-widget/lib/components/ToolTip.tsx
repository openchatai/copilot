"use client";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { forwardRef, ComponentProps } from "react";
import cn from "../utils/cn";

const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipRoot = TooltipPrimitive.Root;

const Tooltip = forwardRef(
  ({ children, ...rest }: ComponentProps<typeof TooltipRoot>, ref) => {
    return (
      <TooltipPrimitive.Provider>
        <TooltipRoot {...rest}>{children}</TooltipRoot>
      </TooltipPrimitive.Provider>
    );
  }
);

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
      "opencopilot-text-white opencopilot-rounded-md opencopilot-font-medium opencopilot-px-2 opencopilot-bg-black opencopilot-z-[50000] opencopilot-py-1 opencopilot-overflow-hidden opencopilot-shadow opencopilot-min-w-fit opencopilot-max-w-[15rem] opencopilot-p-1 opencopilot-text-xs",
      "opencopilot-animate-in opencopilot-fade-in-0 opencopilot-slide-in-from-bottom-5 data-[state=closed]:animate-out data-[state=closed]:opencopilot-slide-in-from-top-0",
      className
    )}
    {...props}
  >
    {children}
  </TooltipPrimitive.Content>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent };
