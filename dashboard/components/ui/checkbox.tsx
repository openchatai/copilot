"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
type Props = {
  CheckedIcon?: LucideIcon;
  UncheckedIcon?: LucideIcon;
} & React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  Props
>(({ className, CheckedIcon, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "flex-center peer h-4 w-4 shrink-0 overflow-hidden rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-primary-foreground",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-primary")}
      asChild
    >
      {CheckedIcon ? (
        <CheckedIcon className="h-3 w-3" />
      ) : (
        <Check className="h-3 w-3" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
