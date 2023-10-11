import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bot,
  ScrollText,
  Settings,
  GithubIcon,
  PlaySquare,
  ExternalLink,
} from "lucide-react";
import SelectWorkspace from "./SelectWorkspace";


export default function Aside() {
  return (
    <aside className="h-full flex flex-col w-aside justify-between border-r border-border bg-primary-foreground overflow-hidden">
      <div className="w-full border-r border-b border-border bg-primary-foreground h-header">
        <SelectWorkspace />
      </div>
      <div className="w-full h-full py-4 px-0 flex-1 overflow-auto space-y-4">
        <ul className="space-y-1 px-2">
          <li>
            <button className="justify-between text-sm font-normal items-center gap-1 px-4 py-2 w-full rounded text-accent-foreground flex hover:bg-card-foreground">
              <div className="flex items-center flex-1 gap-2">
                <Bot className="h-5 w-5" />
                <span>Copilots</span>
              </div>
              <span className="text-sm">2</span>
            </button>
          </li>
        </ul>

        <ul className="space-y-1 px-2">
          <li>
            <button className="justify-between group items-center gap-1 px-4 py-2 w-full rounded text-accent-foreground flex font-normal hover:bg-card-foreground">
              <div className="flex items-center flex-1 gap-2">
                <PlaySquare className="h-5 w-5" />
                <span>Learn</span>
              </div>
              <span className="text-sm opacity-0 group-hover:opacity-100">
                <ExternalLink className="h-4 w-4" />
              </span>
            </button>
          </li>
          <li>
            <button className="justify-between group items-center gap-1 px-4 py-2 w-full rounded text-accent-foreground flex font-normal hover:bg-card-foreground">
              <div className="flex items-center flex-1 gap-2">
                <ScrollText className="h-5 w-5" />
                <span>Changelog</span>
              </div>
              <span className="text-sm font-normal opacity-0 group-hover:opacity-100">
                <ExternalLink className="h-4 w-4" />
              </span>
            </button>
          </li>

          <li>
            <button className="justify-between group items-center gap-1 px-4 py-2 w-full rounded text-accent-foreground flex font-normal hover:bg-card-foreground">
              <div className="flex items-center flex-1 gap-2">
                <GithubIcon className="h-5 w-5" />
                <span>Github</span>
              </div>
              <span className="text-sm font-normal opacity-0 group-hover:opacity-100">
                <ExternalLink className="h-4 w-4" />
              </span>
            </button>
          </li>
        </ul>

        <ul className="space-y-1 px-2">
          <li>
            <button className="justify-between group items-center gap-1 px-4 py-2 w-full rounded text-accent-foreground flex font-normal hover:bg-card-foreground">
              <div className="flex items-center flex-1 gap-2">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </div>
            </button>
          </li>
        </ul>
      </div>
      <div className="border-t border-border py-4 px-5 hover:bg-card-foreground">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>AH</AvatarFallback>
          </Avatar>
          <h2 className="line-clamp-1 text-sm font-semibold">Ahmad Hassan</h2>
        </div>
      </div>
    </aside>
  );
}
