import { HeaderShell } from "@/app/(main)/parts/Header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  ChevronRight,
  Home,
  MessagesSquare,
  Settings2,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function CopilotLayout({ children }: Props) {
  return (
    <div className="flex">
      <aside className="h-full w-header shrink-0 border-r border-border flex flex-col justify-between items-stretch">
        <div className="h-header border-b border-border flex items-center justify-center p-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="text-xl w-full h-full relative group text-primary/90"
              >
                O
                <ChevronRight className="w-4 h-4 absolute bottom-0 right-0 rotate-45 fill-current group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" sideOffset={2} className="ms-5">
              <DropdownMenuItem asChild>
                <Link href="/">Back to dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Search Copilots</DropdownMenuItem>
              <DropdownMenuItem>Chat with the Copilot</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1 overflow-y-auto overflow-hidden mx-auto pt-5">
          <div className="flex items-center flex-col gap-2">
          <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="text-accent-foreground/50 hover:text-primary transition-colors">
                    <Home className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Overview</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center flex-col gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="text-accent-foreground/50 hover:text-primary transition-colors">
                    <Settings2 className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="text-accent-foreground/50 hover:text-primary transition-colors">
                    <MessagesSquare className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Conversations <strong className="text-white">30</strong>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="text-accent-foreground/50 hover:text-primary transition-colors">
                    <Workflow className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Flows <strong className="text-white">20</strong>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="mx-auto pb-5">
          <Separator className="mb-5" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="text-accent-foreground/50 hover:text-primary transition-colors">
                  <AlertCircle className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Help</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <HeaderShell>
          <h1>Copilot 1</h1>
        </HeaderShell>
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
