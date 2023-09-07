"use client";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { forwardRef } from "react";
import cn from "../utils/cn";
// generate js doc
/**
 * @param {string} className
 * @param {string} orientation
 * @param {boolean} decorative
 * @param {string} label
 * @param {string} labelClassName prefix with "after:" to apply to the label
 * @param {React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>} props
 * @returns {React.ElementRef<typeof SeparatorPrimitive.Root>}
 * @constructor
 * @function
 * @name Separator
 * */
const Separator = forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    label?: string;
    labelClassName?: string;
  }
>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      label,
      labelClassName,
      ...props
    },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      aria-label={label}
      className={cn(
        "shrink-0 bg-slate-200 dark:bg-slate-700 rounded-full inline-block",
        orientation === "horizontal" ? "h-px w-full my-3" : "h-full w-px mx-3",
        label &&
          `relative z-[1] after:absolute after:content-[attr(aria-label)] after:uppercase after:text-xs after:bg-inherit after:px-0.5 after:w-fit after:h-fit after:z-[2] after:left-1/2 after:top-0 after:-translate-x-1/2 after:-translate-y-1/2 ` +
            labelClassName,
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
