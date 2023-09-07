import React, { forwardRef, type ComponentPropsWithoutRef } from "react";
import cn from "../utils/cn";
import { tv, VariantProps } from "tailwind-variants";
import { Slot } from "@radix-ui/react-slot";

const badge = tv({
  base: "badge inline-flex font-medium px-2.5 py-1 text-white rounded-full text-center",
  variants: {
    intent: {
      primary:
        "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/30 dark:text-indigo-400",
      secondary: "bg-sky-100 text-sky-600 dark:bg-sky-500/30 dark:text-sky-400",
      success:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/30 dark:text-emerald-400",
      warning:
        "bg-amber-100 text-amber-600 dark:bg-amber-400/30 dark:text-amber-400",
      danger:
        "bg-rose-100 text-rose-500 dark:text-rose-400 dark:bg-rose-500/30",
      info: "bg-blue-100 text-blue-600 dark:bg-blue-500/30 dark:text-blue-500",
      light:
        "bg-slate-100 text-slate-500 dark:text-slate-600 dark:bg-slate-300",
      dark: "bg-slate-700 text-slate-100 dark:text-slate-400",
      "basic-success": "bg-emerald-500 px-1.5",
      "basic-warn": "bg-amber-500 px-1.5",
    },
    size: {
      sm: "text-sm",
      xs: "text-xs",
    },
    indicator: {
      true: "!py-0.5",
    },
  },
  defaultVariants: {
    size: "xs",
    intent: "primary",
  },
});

type Props = {
  children?: React.ReactNode;
  asChild?: boolean;
} & VariantProps<typeof badge> &
  ComponentPropsWithoutRef<"span">;

const Badge = forwardRef<HTMLSpanElement, Props>(
  ({ className, intent,asChild, size, indicator, ...props }, _ref) => {
    const Comp = asChild ? Slot : "span";
    return (
      <Comp
        {...props}
        ref={_ref}
        className={cn(badge({ intent, size, indicator }), className)}
      />
    );
  }
);
Badge.displayName = "Badge";
export default Badge;
