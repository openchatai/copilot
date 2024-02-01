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
      "text-white rounded-md font-medium px-2 bg-black z-[50000] py-1 overflow-hidden shadow min-w-fit max-w-[15rem] p-1 text-xs",
      "animate-in  fade-in-0 slide-in-from-bottom-5 data-[state=closed]:animate-out data-[state=closed]:slide-in-from-top-0",
      className
    )}
    {...props}
  >
    {children}
  </TooltipPrimitive.Content>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent };
