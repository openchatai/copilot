import { Tooltip, TooltipContent, TooltipTrigger } from "./ToolTip";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User } from "lucide-react";
import cn from "../utils/cn";
import formatTimeFromTimestamp from "../utils/formatTime";
import { FailedMessage, useChat } from "@lib/contexts/Controller";
import { getLast, isEmpty } from "@lib/utils/utils";
import { useConfigData } from "@lib/contexts/ConfigData";
import useTypeWriter from "@lib/hooks/useTypeWriter";
import { Vote } from "./Vote";
import { Grid } from "react-loader-spinner";

function BotIcon({ error }: { error?: boolean }) {
  return (
    <img
      className={cn(
        "h-7 w-7 rounded-lg shrink-0 object-cover aspect-square hover:shadow",
        error && "border border-rose-500 shadow-none"
      )}
      src="https://cdn.dribbble.com/users/281679/screenshots/14897126/media/f52c47307ac2daa0c727b1840c41d5ab.png?compress=1&resize=1600x1200&vertical=center"
      alt="bot's avatar"
    />
  );
}

function UserIcon() {
  const config = useConfigData();
  return (
    <Tooltip>
      <TooltipContent hidden={!config?.user} side="top" align="center">
        {config?.user?.name}
      </TooltipContent>
      <TooltipTrigger asChild>
        <div className="rounded-lg shrink-0 bg-accent h-7 w-7 object-cover aspect-square border border-primary flex items-center justify-center">
          <span className="text-xl text-primary fill-current">
            <User />
          </span>
        </div>
      </TooltipTrigger>
    </Tooltip>
  );
}

export function BotTextMessage({
  message,
  id,
}: {
  message: string;
  timestamp?: number | Date;
  id?: string | number;
}) {
  const { messages, lastMessageToVote } = useChat();
  const isLast = getLast(messages)?.id === id;
  if (isEmpty(message)) return null;
  return (
    <div className="p-2 group w-full shrink-0">
      <div className="flex items-start gap-3 w-full text-start" dir="auto">
        <BotIcon />
        <div className="space-y-2 flex-1">
          <div className=" w-fit">
            <div dir="auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-slate font-medium text-sm prose-sm prose-h1:font-medium prose-h2:font-normal prose-headings:my-1 max-w-full"
              >
                {message}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      {isLast && (
        <div className="w-full ps-10 flex-nowrap flex items-center justify-between">
          <span className="text-xs m-0">Bot</span>
          {lastMessageToVote && isLast && (
            <Vote messageId={lastMessageToVote} />
          )}
        </div>
      )}
    </div>
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
      <UserIcon />
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="prose prose-slate font-medium text-sm prose-sm">
              {content}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <span>{timestamp && formatTimeFromTimestamp(timestamp)}</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export function BotMessageLoading({ displayText }: { displayText: string }) {
  return (
    <div className="p-2 flex items-center shrink-0 gap-3 w-full">
      <div className="loading flex-col w-7 flex h-7 bg-accent text-primary rounded-lg shrink-0 mt-auto flex-center">
        <Grid
          height="15"
          width="15"
          color="var(--opencopilot-primary-clr)"
          visible={true}
        />
      </div>
      <div className="space-y-2 flex-1">
        <div className="w-fit">
          <p className="block text-sm">{displayText}</p>
        </div>
      </div>
    </div>
  );
}

export function BotMessageError({ message }: { message?: FailedMessage }) {
  const { displayText } = useTypeWriter({
    text: "Error sending the message.",
    every: 0.001,
  });
  return (
    <div className="clear-both shrink-0 w-full p-2">
      <div className=" flex items-center gap-3 w-full">
        <BotIcon error />
        <div className=" text-rose-500 text-sm">{displayText}</div>
      </div>
    </div>
  );
}
