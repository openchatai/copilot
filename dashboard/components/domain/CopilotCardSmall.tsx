import { BotIcon, Terminal } from "lucide-react";
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
      <div className="group relative flex h-56 items-center justify-center rounded-lg border bg-secondary p-5 shadow-sm">
        <div className="absolute left-2 top-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="rounded-full bg-white p-1.5 shadow-lg">
                <Terminal className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                created via <span className="text-white">CLI</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div>
          <div className="grid aspect-square h-20 place-content-center rounded-lg bg-slate-950 text-gray-100">
            <BotIcon className="h-12 w-12" />
          </div>
        </div>
      </div>
      <div className="mt-1.5 ps-1">
        <Link
          href="/copilot/12346879798"
          className="line-clamp-1 text-ellipsis whitespace-nowrap text-sm font-semibold"
        >
          Copilot 1
        </Link>
        <p className="text-xs text-gray-400">Created 2 days ago</p>
      </div>
    </div>
  );
}
