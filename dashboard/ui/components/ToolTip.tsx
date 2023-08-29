"use client";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import cn from "../utils/cn";
import { forwardRef } from "react";

const Tooltip = TooltipPrimitive.Root;
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, children, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    dir="auto"
    className={cn(
      "z-50 overflow-hidden shadow rounded text-slate-800 p-2 min-w-60 bg-white animate-in fade-in-0 max-w-[15rem] zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-slate-700 dark:text-slate-100 border-slate-200 dark:border-slate-600 m-0",
      className
    )}
    {...props}
  >
    {children}
    <TooltipPrimitive.Arrow className="fill-current text-white dark:text-slate-700" />
  </TooltipPrimitive.Content>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
