"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";

type RenderProps = {
  isActive: boolean;
};

interface Props
  extends Omit<React.ComponentPropsWithoutRef<typeof Link>, "children"> {
  activeClassName?: string;
  inactiveClassName?: string;
  segment?: string;
  children?:
    | React.ReactNode
    | (({ isActive }: RenderProps) => React.JSX.Element);
}

export const NavLink = React.forwardRef<React.ElementRef<typeof Link>, Props>(
  (
    {
      className,
      activeClassName,
      segment,
      inactiveClassName,
      children,
      ...props
    },
    _ref,
  ) => {
    const pathname = usePathname();
    const segments = useSelectedLayoutSegments();
    const isActive = segment
      ? segments.includes(segment)
      : props.href === pathname;
    return (
      <Link
        {...props}
        // eslint-disable-next-line react/no-children-prop
        children={
          <>
            {typeof children === "function"
              ? children({ isActive })
              : children ?? props.href}
          </>
        }
        ref={_ref}
        className={cn(
          className,
          isActive ? activeClassName : inactiveClassName,
        )}
      />
    );
  },
);
NavLink.displayName = "NavLink";
