"use client";
import Badge from "@/ui/components/Badge";
import { CardWrapper } from "../components/wrappers/CardWrapper";
import { Link } from "@/ui/router-events";
import { FaRobot } from "react-icons/fa";
import { BiLinkExternal } from "react-icons/bi";
import type { Copilot } from "api/copilots";

export function ChatBotCard({
  id,
  name,
  status,
}: Copilot & {
  className?: string;
}) {
  return (
    <CardWrapper className="group col-span-full sm:col-span-6 xl:col-span-4 relative after:absolute after:z-[5] hover:after:opacity-100 after:inset-0 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-500 after:[background:_radial-gradient(600px_circle_at_top_right,theme(colors.slate.100),transparent)] dark:after:[background:_radial-gradient(600px_circle_at_top_right,theme(colors.slate.700),transparent)]">
      <Link
        href={`/app/bot/${id}/`}
        className="dark:bg-slate-700 dark:text-white bg-slate-200 text-slate-800 opacity-0 group-hover:opacity-100 transition-all rounded-full p-1.5 text-lg absolute top-0 right-0 z-[6] translate-x-1/2 -translate-y-1/2"
      >
        <span>
          <BiLinkExternal className="animate-pulse" />
        </span>
      </Link>
      <div className="flex flex-col h-full relative z-10">
        <header>
          <div className="text-2xl w-fit aspect-square h-auto text-white rounded-full bg-indigo-500 p-2">
            <FaRobot />
          </div>
        </header>
        <div className="grow mt-1">
          <Link
            href={`/app/bot/${id}`}
            className="inline-flex text-slate-800 dark:text-slate-100 hover:text-slate-900 dark:hover:text-white mb-1"
          >
            <h2 className="text-xl leading-snug font-semibold">{name}</h2>
          </Link>
        </div>
        <footer className="mt-1">
          <div className="flex justify-between items-center">
            <div className="space-x-2">
              <Badge
                intent={
                  status === "archived"
                    ? "warning"
                    : status === "draft"
                    ? "info"
                    : "success"
                }
              >
                {status}
              </Badge>
            </div>
          </div>
        </footer>
      </div>
    </CardWrapper>
  );
}
