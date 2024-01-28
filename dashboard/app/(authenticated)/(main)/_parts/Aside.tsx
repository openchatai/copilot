import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bot,
  Github,
  PlaySquare,
} from "lucide-react";
import { Link } from "@/lib/router-events";
import { Logo } from "@/components/domain/Logo";
import { Tooltip } from "@/components/domain/Tooltip";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CopilotLayoutNavLink } from "../../(copilot)/_parts/CopilotNavLink";

export default function Aside() {
  return (
    <aside className="flex h-full w-header flex-col justify-between overflow-hidden border-r border-border bg-primary-foreground">
      <Link href='/' className="h-header w-full border-b flex-center border-r border-border bg-primary-foreground">
        <Logo />
      </Link>
      <div className="h-full w-full flex-1 space-y-4 overflow-auto px-0 py-4">
        <div className="space-y-1 p-2 gap-2 flex flex-col items-center">
          <CopilotLayoutNavLink
            IconComponent={Bot}
            label="Copilots"
            href="/"
          />
          <Tooltip content={<>Tutorials</>} side="right">
            <Link
              href="https://opencopilot.so/#tuts"
              target="_blank"
              className={cn("hover:text-primary text-accent-foreground/50 hover:bg-accent", buttonVariants({ size: "icon", variant: "link" }))}
            >
              <PlaySquare className="h-5 w-5" />
            </Link>
          </Tooltip>
          <Tooltip content={<>Tutorials</>} side="right">
            <Link
              href="https://github.com/openchatai/opencopilot"
              target="_blank"
              className={cn("hover:text-primary text-accent-foreground/50 hover:bg-accent", buttonVariants({ size: "icon", variant: "link" }))}
            >
              <Github className="h-5 w-5" />
            </Link>
          </Tooltip>
        </div>
      </div>
      <div className="border-t flex-center border-border px-5 py-2">
        <Tooltip content='Local User' side="right">
          <Avatar size='large'>
            <AvatarFallback className="bg-accent">
              LA
            </AvatarFallback>
          </Avatar>
        </Tooltip>
      </div>
    </aside>
  );
}
