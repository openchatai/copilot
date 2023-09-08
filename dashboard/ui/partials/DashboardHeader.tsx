"use client";
import ProfilePopover from "./HeaderPopover";
import Logo from "./Logo";
import { Bots } from "./DashboardHeaderBotsList";
import { useParams, useSelectedLayoutSegments } from "next/navigation";
import cn from "../utils/cn";
import { Link } from "../router-events";
import { useIsOnline } from "../providers/OnlineStateProvider";

export function Header() {
  const { bot_id } = useParams();
  const { online } = useIsOnline();
  const segments = useSelectedLayoutSegments();
  const isBotLayout = segments.includes("bot");
  return (
    <header
      id="dashboard-header"
      className={cn(
        "sticky max-h-[var(--header-height)] min-h-fit shrink-0 top-0 bg-white dark:bg-[#182235] border-b border-slate-200 dark:border-slate-700 z-30",
        isBotLayout && "border-b-0"
      )}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="w-full h-16 flex gap-5 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/app">
              <Logo />
            </Link>
            {bot_id && (
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-2xl font-light">/</span>
                <Bots />
              </div>
            )}
          </div>
          <div className="actions flex items-center gap-3">
            <ProfilePopover />
            <div
              data-online={online}
              className="w-2 h-2 rounded-full data-[online=false]:bg-rose-500 data-[online=true]:bg-emerald-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
