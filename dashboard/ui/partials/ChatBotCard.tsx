import { CardWrapper } from "../components/wrappers/CardWrapper";
import { Link } from "@/ui/router-events";
import type { Copilot } from "api/copilots";

export function ChatBotCard({
  id,
  name,
  status,
  created_at,
}: Copilot & {
  className?: string;
}) {
  return (
    <CardWrapper className="col-span-full sm:col-span-6 xl:col-span-4 relative after:absolute after:z-[5] hover:after:opacity-100 after:inset-0 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-500 after:[background:_radial-gradient(600px_circle_at_top_right,theme(colors.slate.100),transparent)] dark:after:[background:_radial-gradient(600px_circle_at_top_right,theme(colors.slate.700),transparent)]">
      <div className="flex flex-col h-full relative z-10">
        <header>
          <div className="w-10 h-10 text-2xl rounded-full flex items-center justify-center shrink-0 bg-rose-500 aspect-square">
            <svg className="w-9 h-9 fill-current text-rose-50" viewBox="0 0 36 36">
              <path d="M25 24H11a1 1 0 01-1-1v-5h2v4h12v-4h2v5a1 1 0 01-1 1zM14 13h8v2h-8z"></path>
            </svg>
          </div>
        </header>
        <div className="grow mt-2">
          <Link href={`/app/bot/${id}`} className="inline-flex">
            <h2 className="text-xl font-semibold text-slate-800 hover:text-slate-900 mb-1 dark:text-slate-100 dark:hover:text-white">
              {name}
            </h2>
          </Link>
        </div>
        <footer className="mt-5">
          {created_at && (
            <span className="block text-sm font-medium text-slate-500 mb-2">
              {new Date(created_at).toISOString()}
            </span>
          )}
          <div className="flex justify-between items-center">
            <Link
              className="text-sm font-medium text-indigo-500 hover:text-indigo-600"
              href={`/app/bot/${id}`}
            >
              open {`->`}
            </Link>
          </div>
        </footer>
      </div>
    </CardWrapper>
  );
}
