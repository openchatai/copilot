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
import { NavLink } from "@/components/ui/NavLink";
import Link from "next/link";

export default function Aside() {
  return (
    <aside className="flex h-full w-aside flex-col justify-between overflow-hidden border-r border-border bg-primary-foreground">
      <div className="h-header w-full border-b border-r border-border bg-primary-foreground">
        <SelectWorkspace />
      </div>
      <div className="h-full w-full flex-1 space-y-4 overflow-auto px-0 py-4">
        <ul className="space-y-1 px-2">
          <li>
            <NavLink
              href="/"
              className="flex items-center rounded-md border text-base font-normal text-accent-foreground transition duration-150 ease-in-out px-4 py-2"
              activeClassName="border-gray-300 bg-accent"
              inactiveClassName="border-transparent hover:border-gray-300 opacity-80 hover:bg-accent text-sm hover:bg-card-foreground"
            >
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span>Copilots</span>
              </div>
            </NavLink>
          </li>
        </ul>

        <ul className="space-y-1 px-2">
          <li>
            <Link
              href="https://opencopilot.so/#tuts"
              target="_blank"
              className="group flex w-full items-center justify-between gap-1 rounded px-4 py-2 text-base font-light text-accent-foreground transition duration-150 ease-in-out hover:bg-card-foreground"
            >
              <div className="flex flex-1 items-center gap-2">
                <PlaySquare className="h-4 w-4" />
                <span>Learn</span>
              </div>
              <span className="text-sm opacity-0 group-hover:opacity-100">
                <ExternalLink className="h-4 w-4" />
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="https://github.com/openchatai/OpenCopilot/releases"
              target="_blank"
              className="group flex w-full items-center justify-between gap-1 rounded px-4 py-2 text-base font-light text-accent-foreground transition duration-150 ease-in-out hover:bg-card-foreground"
            >
              <div className="flex flex-1 items-center gap-2">
                <ScrollText className="h-4 w-4" />
                <span>Changelog</span>
              </div>
              <span className="text-sm font-normal opacity-0 group-hover:opacity-100">
                <ExternalLink className="h-4 w-4" />
              </span>
            </Link>
          </li>

          <li>
            <Link
              href="https://github.com/openchatai/OpenCopilot"
              target="_blank"
              className="group flex w-full items-center justify-between gap-1 rounded px-4 py-2 text-base font-light text-accent-foreground transition duration-150 ease-in-out hover:bg-card-foreground"
            >
              <div className="flex flex-1 items-center gap-2">
                <GithubIcon className="h-4 w-4" />
                <span>Github</span>
              </div>
              <span className="text-sm font-normal opacity-0 group-hover:opacity-100">
                <ExternalLink className="h-4 w-4" />
              </span>
            </Link>
          </li>
        </ul>

        <ul className="space-y-1 px-2">
          <li>
            <NavLink
              className="group flex w-full items-center justify-between gap-1 rounded px-4 py-2 text-base font-normal text-accent-foreground hover:bg-card-foreground"
              href="/settings"
            >
              <div className="flex flex-1 items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </div>
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="border-t border-border px-5 py-4 hover:bg-card-foreground">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <h2 className="line-clamp-1 text-sm font-semibold">User</h2>
        </div>
      </div>
    </aside>
  );
}
