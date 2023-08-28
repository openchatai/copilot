import { ComponentPropsWithoutRef, forwardRef } from "react";
import { tv, VariantProps } from "tailwind-variants";
import cn from "../utils/cn";
import { Slot } from "@radix-ui/react-slot";
export const buttonVariants = tv({
  base: "rounded text-sm border outline-none relative focus:outline-none whitespace-nowrap [&:active:not(:disabled)]:opacity-90 [&:active:not(:disabled)]:scale-[0.98] border-transparent transition duration-150 ease-in-out font-medium inline-flex items-center justify-center leading-5 shadow-sm disabled:cursor-not-allowed disabled:shadow-none disabled:text-slate-400 disabled:bg-slate-100 disabled:border-slate-200 dark:disabled:border-slate-600 data-[loading=true]:text-slate-400 data-[loading=true]:bg-slate-100 data-[loading=true]:border-slate-200 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-600 ",
  variants: {
    intent: {
      success:
        "bg-emerald-500 hover:bg-emerald-600 text-white hover:bg-opacity-80",
      "success-ghost":
        "border-slate-200 hover:border-slate-300 text-emerald-500 hover:border-opacity-80",
      primary: "text-white bg-indigo-500 hover:bg-indigo-600",
      "primary-ghost":
        "text-indigo-500 bg-transparent border-slate-200 dark:!border-slate-700",
      icon: "!p-1.5 shrink-0 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm",
      danger:
        "text-white bg-rose-500 hover:bg-opacity-80 hover:border-opacity-80",
      base: "border-none bg-transparent text-slate-600 dark:text-slate-300 !p-0 disabled:!bg-transparent",
      tertiary:
        "hover:border-opacity-80 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300",
      secondary:
        "hover:border-opacity-80 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-indigo-500",
      "danger-ghost":
        "hover:border-opacity-80 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-rose-500",
    },
    size: {
      xs: "px-2 py-0.5",
      sm: "px-2 py-1",
      lg: "px-4 py-3",
      base: "px-3 py-2 ",
    },
    width: {
      fit: "w-fit",
      fluid: "w-full",
    },
  },
  compoundVariants: [
    {
      intent: "icon",
      size: "xs",
      class: "flex items-center justify-center",
    },
  ],
  defaultVariants: {
    intent: "tertiary",
    size: "base",
    width: "fit",
  },
});

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: VariantProps<typeof buttonVariants>;
  loading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, loading, asChild, type = "button", ...props },
    _ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={_ref}
        type={type}
        {...props}
        data-loading={loading}
        className={cn(buttonVariants(variant), className)}
      />
    );
  }
);

Button.displayName = "Button";
