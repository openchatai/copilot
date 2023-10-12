"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
interface Props extends React.ComponentPropsWithoutRef<typeof Link> {
  activeClassName?: string;
  inactiveClassName?: string;
  segment?: string;
}

export const NavLink = React.forwardRef<React.ElementRef<typeof Link>, Props>(
  (
    { className, activeClassName, segment, inactiveClassName, ...props },
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
