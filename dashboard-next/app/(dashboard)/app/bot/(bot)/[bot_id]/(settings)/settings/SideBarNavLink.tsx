"use client";
import BaseNavLink from "@/ui/components/NavLink";
import cn from "@/ui/utils/cn";
import { ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";

export function SideBarNavLink({
  href,
  label,
  Icon,
}: {
  href: string;
  Icon: ReactNode;
  label: string;
}) {
  return (
    <li className="mr-0.5 md:mr-0 md:mb-0.5">
      <BaseNavLink
        href={href}
        className="flex items-center px-2.5 py-2 rounded whitespace-nowrap"
        activeClasses="bg-indigo-50 dark:bg-indigo-500/30"
        render={({ active }) => {
          return (
            <>
              <Slot
                className={cn(
                  "w-4 h-4 shrink-0 fill-current mr-2",
                  active
                    ? "text-indigo-500 dark:text-indigo-400"
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                {Icon}
              </Slot>

              <span
                className={cn(
                  "text-sm font-medium ",
                  active
                    ? "text-indigo-500 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200"
                )}
              >
                {label}
              </span>
            </>
          );
        }}
      />
    </li>
  );
}
