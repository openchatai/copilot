"use client";
import NavLink from "@/ui/components/NavLink";
import { motion } from "framer-motion";
import type { ComponentProps } from "react";

export function Nav({ children, ...props }: ComponentProps<typeof NavLink>) {
  return (
    <NavLink
      className="bot_nav_link relative px-2 font-medium py-1 "
      activeClasses="text-indigo-500 group/navlink"
      inactiveClasses="text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      {...props}
      render={({ active }) => (
        <>
          {active && (
            <motion.div
              transition={{
                duration: 0.5,
                type: "spring",
                bounce: 0.2,
              }}
              style={{
                height: "2px",
                borderRadius: "8px",
              }}
              layoutId="active-bot-tab"
              className="absolute bg-indigo-500 -bottom-2 translate-y-px block w-full inset-x-0 group-hover/navlink:h-1"
            />
          )}
          <span className="relative">{children}</span>
        </>
      )}
    />
  );
}
