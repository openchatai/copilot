import { buttonVariants } from "@/components/ui/button";
import { NavLink } from "@/components/ui/NavLink";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";
import React from "react";

export function CopilotLayoutNavLink({
  IconComponent,
  label,
  href,
  segment,
}: {
  label: React.ReactNode;
  IconComponent: LucideIcon;
  href: string;
  segment?: string;
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            href={href}
            segment={segment}
            className={buttonVariants({
              size: "icon",
              variant: "link",
            })}
            activeClassName="text-primary bg-accent"
            inactiveClassName="hover:text-primary text-accent-foreground/50 hover:bg-accent"
          >
            <IconComponent className="h-5 w-5" />
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
