import { NavLink } from "@/components/ui/NavLink";
import { LucideIcon } from "lucide-react";
import React from "react";

export function SubNavLink({
    href,
    Icon,
    label,
  }: {
    href: string;
    Icon: LucideIcon;
    label: React.ReactNode;
  }) {
    return (
      <li className="w-full cursor-pointer select-none ">
        <NavLink
          href={href}
          className="flex items-center rounded-md border px-3 py-2 text-sm text-accent-foreground transition duration-150 ease-in-out"
          activeClassName="border-gray-300 bg-accent font-semibold"
          inactiveClassName="border-transparent hover:border-gray-300 font-normal opacity-80 hover:bg-accent"
        >
          <Icon className="mr-2 h-5 w-5" />
          {label}
        </NavLink>
      </li>
    );
  }
  