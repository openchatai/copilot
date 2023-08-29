"use client";
import { Link } from "@/ui/router-events";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import React, { type ComponentProps, forwardRef } from "react";
import cn from "../utils/cn";

type Props = {
  activeClasses?: string;
  inactiveClasses?: string;
  render?: (props: { active: boolean }) => React.ReactNode;
  segment?: string;
} & ComponentProps<typeof Link>;

const NavLink = forwardRef<HTMLAnchorElement, Props>(
  (
    {
      children,
      className,
      activeClasses,
      inactiveClasses,
      render,
      segment,
      ...props
    },
    _ref
  ) => {
    const pathname = usePathname();
    const segments = useSelectedLayoutSegments();

    const active = segment
      ? segments.includes(segment)
      : pathname === props.href;

    return (
      <Link
        {...props}
        ref={_ref}
        data-active={active}
        className={cn(
          "whitespace-nowrap inline-block",
          className,
          active && activeClasses,
          active && "pointer-events-none select-none",
          !active && inactiveClasses
        )}
      >
        {render ? render({ active }) : children}
      </Link>
    );
  }
);
NavLink.displayName = "NavLink";
export default NavLink;
