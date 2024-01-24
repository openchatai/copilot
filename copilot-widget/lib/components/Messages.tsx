import { Grid } from "react-loader-spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ToolTip";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User } from "lucide-react";
import { format } from "timeago.js";
import cn from "../utils/cn";
import formatTimeFromTimestamp from "../utils/formatTime";
import { FailedMessage, useChat } from "@lib/contexts/Controller";
import { getLast, isEmpty } from "@lib/utils/utils";
import { useConfigData } from "@lib/contexts/ConfigData";
import useTypeWriter from "@lib/hooks/useTypeWriter";
import { Vote } from "./Vote";

function BotIcon({ error }: { error?: boolean }) {
  return (
    <img
      className={cn(
        "opencopilot-h-7 opencopilot-w-7 opencopilot-rounded-lg opencopilot-shrink-0 opencopilot-object-cover opencopilot-aspect-square hover:opencopilot-shadow",
        error && "opencopilot-border opencopilot-border-rose-500 opencopilot-shadow-none"
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
        <div className="opencopilot-rounded-lg opencopilot-shrink-0 opencopilot-bg-accent opencopilot-h-7 opencopilot-w-7 opencopilot-object-cover opencopilot-aspect-square opencopilot-border opencopilot-border-primary opencopilot-flex opencopilot-items-center opencopilot-justify-center">
          <span className="opencopilot-text-xl opencopilot-text-primary opencopilot-fill-current">
            <User />
          </span>
        </div>
      </TooltipTrigger>
    </Tooltip>
  );
}
function useVote() {
  const {
    setLastMessageId,
    lastMessageToVote
  } = useChat();

  return {

  }
}
export function BotTextMessage({
  message,
  timestamp,
  id,
}: {
  message: string;
  timestamp?: number | Date;
  id?: string | number;
}) {
  const { messages } = useChat();
  const isLast = getLast(messages)?.id === id;
  console.log({ id });
  if (isEmpty(message)) return null;
  return (
    <div className="opencopilot-p-2 group opencopilot-w-full opencopilot-shrink-0">
      <div
        className="opencopilot-flex opencopilot-items-start opencopilot-gap-3 opencopilot-w-full"
        dir="auto"
      >
        <BotIcon />
        <div className="opencopilot-space-y-2 opencopilot-flex-1">
          <div className="opencopilot-w-fit">
            <div dir="auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="opencopilot-prose opencopilot-prose-slate opencopilot-font-medium opencopilot-text-sm opencopilot-prose-sm prose-h1:opencopilot-font-medium prose-h2:opencopilot-font-normal prose-headings:opencopilot-my-1 opencopilot-max-w-full"
              >
                {message}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      {isLast && (
        <div className="opencopilot-w-full opencopilot-ps-10 opencopilot-flex opencopilot-items-center opencopilot-justify-between">
          {timestamp && (
            <span className="opencopilot-text-xs opencopilot-m-0">
              Bot · {format(timestamp)}
            </span>
          )}
          <Vote
            isDownvoted={false}
            isUpvoted={false}
          />
        </div>
      )}
    </div>
  );
}

export function BotMessageLoading({ displayText }: { displayText: string }) {
  return (
    <div className="opencopilot-p-2 opencopilot-flex opencopilot-items-center opencopilot-shrink-0 opencopilot-gap-3 opencopilot-w-full">
      <div className="loading opencopilot-flex-col opencopilot-w-7 opencopilot-flex opencopilot-h-7 opencopilot-bg-accent opencopilot-text-primary opencopilot-rounded-lg opencopilot-shrink-0 opencopilot-mt-auto flex-center">
        <Grid
          height="15"
          width="15"
          color="var(--opencopilot-primary-clr)"
          visible={true}
        />
      </div>
      <div className="opencopilot-space-y-2 opencopilot-flex-1">
        <div className="opencopilot-w-fit">
          <p className="opencopilot-block opencopilot-text-sm">{displayText}</p>
        </div>
      </div>
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
      className="opencopilot-w-full opencopilot-overflow-x-auto opencopilot-shrink-0 opencopilot-max-w-full last-of-type:opencopilot-mb-10 opencopilot-bg-accent opencopilot-p-2 opencopilot-flex opencopilot-gap-3 opencopilot-items-center"
    >
      <UserIcon />
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="opencopilot-prose opencopilot-prose-slate opencopilot-font-medium opencopilot-text-sm opencopilot-prose-sm">
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

export function BotMessageError({ message }: { message?: FailedMessage }) {
  const { displayText } = useTypeWriter({
    text: "Error sending the message.",
    every: 0.001,
  });
  return (
    <div className="opencopilot-clear-both opencopilot-shrink-0 opencopilot-w-full opencopilot-p-2">
      <div className="opencopilot-flex opencopilot-items-center opencopilot-gap-3 opencopilot-w-full">
        <BotIcon error />
        <div className="opencopilot-text-rose-500 opencopilot-text-sm">
          {displayText}
        </div>
      </div>
    </div>
  );
}
