import { UserIcon } from "lucide-react";
import cn from "../utils/cn";
import { formatTimeFromTimestamp } from "../utils/time";
import { getLast, isEmpty } from "@lib/utils/utils";
import { useConfigData } from "@lib/contexts/ConfigData";
import { useChatState } from "@lib/contexts/statefulMessageHandler";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ToolTip";

export function BotIcon({ error }: { error?: boolean }) {
  const config = useConfigData();

  return (
    <img
      className={cn(
        "h-7 w-7 rounded-lg shrink-0 object-cover aspect-square",
        error && "border border-rose-500 shadow-none"
      )}
      src={
        config?.bot?.avatarUrl ||
        "https://cdn.dribbble.com/users/281679/screenshots/14897126/media/f52c47307ac2daa0c727b1840c41d5ab.png?compress=1&resize=1600x1200&vertical=center"
      }
      alt={`${config?.bot?.name ?? "Bot"}'s avatar`}
    />
  );
}

function UserAvatar() {
  const config = useConfigData();

  if (config?.user?.avatarUrl) {
    return (
      <img
        className="h-7 w-7 rounded-lg shrink-0 object-cover aspect-square"
        src={config.user.avatarUrl}
      />
    );
  }

  return (
    <div className="rounded-lg shrink-0 bg-accent h-7 w-7 object-cover aspect-square border border-primary flex items-center justify-center">
      <span className="text-xl text-primary fill-current">
        <UserIcon className="size-[1em]" />
      </span>
    </div>
  );
}

function User() {
  const config = useConfigData();

  return (
    <Tooltip>
      <TooltipContent hidden={!config?.user} side="top" align="center">
        <span>{config?.user?.name}</span>
      </TooltipContent>
      <TooltipTrigger asChild>
        <UserAvatar />
      </TooltipTrigger>
    </Tooltip>
  );
}

export function BotMessageWrapper({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string | number;
}) {
  const { messages } = useChatState();
  const isLast = getLast(messages.filter((m) => m.from === "bot"))?.id === id;
  const config = useConfigData();

  return (
    <div className="p-2 group w-full shrink-0">
      <div className="flex items-center gap-3 w-full" dir="auto">
        <span className="mt-auto">
          <BotIcon />
        </span>
        <div className="flex-1">{children}</div>
      </div>

      {isLast && (
        <div className="w-full ps-10 flex-nowrap flex items-center justify-between">
          <span className="text-xs m-0">{config?.bot?.name ?? "Bot"}</span>
        </div>
      )}
    </div>
  );
}

export function BotInitialMessage({ message }: { message: string }) {
  if (isEmpty(message)) return null;

  return (
    <BotMessageWrapper id={""}>
      <div className="space-y-2 flex-1">
        <div className=" w-fit">
          <div dir="auto">{message}</div>
        </div>
      </div>
    </BotMessageWrapper>
  );
}
export function UserMessage({
  content,
  timestamp,
}: {
  content: string;
  timestamp?: number | Date;
  id?: string | number;
}) {
  return (
    <div
      dir="auto"
      className="w-full overflow-x-auto shrink-0 max-w-full last-of-type:mb-10 bg-accent p-2 flex gap-3 items-center"
    >
      <User />
      <div>
        <p className="prose prose-slate font-medium text-sm prose-sm">
          {content}
        </p>
        <span>{timestamp && formatTimeFromTimestamp(timestamp)}</span>
      </div>
    </div>
  );
}
