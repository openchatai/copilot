import { ComponentPropsWithoutRef, createElement, forwardRef } from "react";
import { tv } from "tailwind-variants";
import cn from "../utils/cn";
const HeadingVariants = tv({
  base:"text-slate-800 dark:text-slate-100 font-semibold block",
  variants: {
    level: {
      1: "text-4xl md:text-5xl font-extrabold",
      2: "text-3xl md:text-4xl font-bold",
      3: "text-3xl font-semibold",
      4: "text-2xl font-medium tracking-tight",
      5: "text-xl font-medium leading-snug",
      6:"text-xl font-normal"
    },
  },
  defaultVariants: {
    level: 4,
  },
});
interface HeadingProps extends ComponentPropsWithoutRef<"h1"> {
  level?: 1 | 2 | 3 | 4 | 5| 6;
}
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level, className, ...props }, _ref) => {
    const C = `h${level}`;
    return createElement(C, {
      ref: _ref,
      className: cn(HeadingVariants({ level: level }), className),
      ...props,
    });
  }
);
Heading.displayName = "Heading";
