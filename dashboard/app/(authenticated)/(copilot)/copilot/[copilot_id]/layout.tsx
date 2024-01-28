import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  MessagesSquare,
  Settings,
  Workflow,
  SquareCode, Codesandbox, Zap, PieChart
} from "lucide-react";
import React from "react";
import { CopilotLayoutNavLink } from "../../_parts/CopilotNavLink";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { CopilotProvider } from "../CopilotProvider";
import { Link } from "@/lib/router-events";
import { Logo } from "@/components/domain/Logo";
import { SearchBtn } from "../../_parts/SearchBtn";

type Props = {
  children: React.ReactNode;
  params: {
    copilot_id: string;
  };
};

export default function CopilotLayout({ children, params }: Props) {
  const copilotBase = `/copilot/${params.copilot_id}`;
  return (
    <div className="flex h-full overflow-hidden">
      <aside className="flex h-full w-header shrink-0 flex-col items-stretch justify-between border-r border-border bg-white">
        <Link href="/" className="flex h-header items-center justify-center border-b border-border p-1">
          <Logo />
        </Link>
        <div className="mx-auto flex-1 overflow-hidden overflow-y-auto pt-5">
          <div className="flex flex-col items-center">
            <CopilotLayoutNavLink
              href={copilotBase}
              IconComponent={SquareCode}
              label="Installation"
            />
          </div>
          <Separator className="my-2" />
          <div className="flex flex-col items-center gap-4">
            <CopilotLayoutNavLink
              href={copilotBase + "/actions"}
              IconComponent={Zap}
              label="Actions"
            />
            <CopilotLayoutNavLink
              href={copilotBase + "/workflow"}
              IconComponent={Workflow}
              segment="workflow"
              label="Flows"
            />
            <CopilotLayoutNavLink
              href={copilotBase + "/knowledge"}
              IconComponent={Codesandbox}
              label="Knowledge Base"
            />
            <CopilotLayoutNavLink
              href={copilotBase + "/conversations"}
              IconComponent={MessagesSquare}
              label="Conversations"
            />
            <CopilotLayoutNavLink
              href={copilotBase + "/settings"}
              segment="settings"
              IconComponent={Settings}
              label="Settings"
            />
            <CopilotLayoutNavLink
              href={copilotBase + "/analytics"}
              IconComponent={PieChart}
              label="Analytics"
            />
          </div>
        </div>
        <div className="mx-auto pb-5 flex flex-col items-center gap-2">
          <Separator />
          <SearchBtn />
          <DropdownMenu modal={false}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="fit"
                      variant="ghost"
                      className="text-accent-foreground/50 rounded-full p-2.5 transition-colors hover:text-primary"
                    >
                      <AlertCircle className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <DropdownMenuContent
                  side="right"
                  sideOffset={10}
                  className="mb-2"
                >
                  <DropdownMenuLabel>Help</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="https://docs.opencopilot.so/" target="_blank">
                      Docs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="https://opencopilot.so/#tuts" target="_blank">
                      Tutorials
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="https://github.com/openchatai/OpenCopilot/issues/new/choose"
                      target="_blank"
                    >
                      Raise a GitHub issue
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
                <TooltipContent side="right">Help</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DropdownMenu>
        </div>
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="h-full min-h-full max-w-full flex-1 bg-primary-foreground">
          <CopilotProvider>{children}</CopilotProvider>
        </div>
      </main>
    </div>
  );
}
