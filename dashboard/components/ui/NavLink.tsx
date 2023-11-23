"use client";
import React from "react";
import { Link } from "@/lib/router-events";
import { cn } from "@/lib/utils";
import {
  usePathname,
  useSearchParams,
  useSelectedLayoutSegments,
} from "next/navigation";
// @TODO:Needs some refacroring.
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
    // eslint-disable-next-line no-unused-vars
    | (({ isActive }: RenderProps) => React.JSX.Element);
  matchSearchParams?: boolean;
}

function pathnamePlusSearchParams(
  pathname: string,
  searchParams?: URLSearchParams,
) {
  const $searchParams = searchParams?.toString();
  const $pathname = pathname.endsWith("/") ? pathname : pathname + "/";
  const $pathnamePlusSearchParams = $searchParams
    ? `${$pathname}?${$searchParams}`
    : $pathname;
  return $pathnamePlusSearchParams;
}

export const NavLink = React.forwardRef<React.ElementRef<typeof Link>, Props>(
  (
    {
      className,
      activeClassName,
      segment,
      inactiveClassName,
      children,
      matchSearchParams = false,
      ...props
    },
    _ref,
  ) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const segments = useSelectedLayoutSegments();
    const $pathnamePlusSearchParams = pathnamePlusSearchParams(
      pathname,
      searchParams,
    );

    const isActive = segment
      ? segments.includes(segment)
      : props.href ===
        (matchSearchParams ? $pathnamePlusSearchParams : pathname);

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
        data-active={isActive}
        className={cn(
          className,
          isActive ? activeClassName : inactiveClassName,
        )}
      />
    );
  },
);
NavLink.displayName = "NavLink";
