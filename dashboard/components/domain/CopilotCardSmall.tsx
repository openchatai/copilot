import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { BotIcon, Terminal } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function CopilotCardSmall() {
  return (
    <div className="xl:aspect-square">
      <div className="rounded-lg relative h-56 border bg-secondary shadow-sm flex items-center justify-center p-5 group">
        <div className="inset-0 absolute backdrop-blur-sm bg-accent-alt/50 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <div className="h-full w-full gap-2 flex items-center justify-center">
            <Button size="lg" asChild>
              <Link href={"/copilot/12346879798/settings"}>Edit</Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" variant="outline">
                  ...
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Rename</DropdownMenuItem>
                <DropdownMenuItem>Detail</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
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
          className="text-sm font-semibold whitespace-nowrap line-clamp-1 text-ellipsis"
        >
          Copilot 1
        </Link>
        <p className="text-xs text-gray-400">Created 2 days ago</p>
      </div>
    </div>
  );
}
