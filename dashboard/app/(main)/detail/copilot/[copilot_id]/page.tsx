import { HeaderShell } from "@/app/(main)/parts/Header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { BotIcon, Terminal } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  params: {
    copilot_id: string;
  };
};

export default function CopilotDetailPage({}: Props) {
  return (
    <div className="w-full h-full flex flex-col">
      <HeaderShell>
        <div className="flex items-center gap-1">
          <Button asChild size="icon" variant="ghost">
            <Link href="/">
              <ChevronLeft className="w-6 h-6 text-accent-foreground" />
            </Link>
          </Button>
          <h1 className="text-lg font-bold inline text-accent-foreground">
            Copilot Detail Page
          </h1>
        </div>
      </HeaderShell>
      <div className="flex-1 p-8 pt-4 overflow-auto">
        <div>
          <div className="rounded-lg relative h-56 border bg-secondary shadow-sm flex items-center justify-center p-5 group">
            <div className="inset-0 absolute backdrop-blur-sm bg-accent-alt/50 group-focus-visible:opacity-100 group-focus-within:opacity-100 transition-opacity">
              <div className="h-full w-full gap-2 flex items-center justify-center">
                <Button size="lg">Edit</Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="lg" variant="secondary">
                      ...
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="left-2 top-2 absolute">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="p-1.5 rounded-full bg-white shadow-lg">
                    <Terminal className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    created via <span className="text-white">CLI</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div>
              <div className="h-20 grid place-content-center aspect-square rounded-lg bg-slate-950 text-gray-100">
                <BotIcon className="h-12 w-12" />
              </div>
            </div>
          </div>
          <div className="mt-1.5 ps-1">
            <Link
              href="/detail/copilot/12346879798"
              className="text-base font-semibold whitespace-nowrap line-clamp-1 text-ellipsis"
            >
              Copilot 1
            </Link>
            <p className="text-sm text-gray-400">Created 2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
