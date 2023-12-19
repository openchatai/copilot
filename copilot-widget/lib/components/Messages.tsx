import { Grid } from "react-loader-spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ToolTip";
import useTypeWriter from "../hooks/useTypeWriter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Clipboard, ClipboardCheck } from "lucide-react";
import { format } from "timeago.js";
import cn from "../utils/cn";
import formatTimeFromTimestamp from "../utils/formatTime";
import { useCopyToClipboard } from "@lib/hooks/useCopy";
import { FailedMessage, useChat } from "@lib/contexts/Controller";
import { getLast } from "@lib/utils/utils";
import { useConfigData } from "@lib/contexts/ConfigData";
import { useTextRotator } from "@lib/hooks/useTextRotator";

function BotIcon({ error }: { error?: boolean }) {
  return (
    <img
      className={cn(
        "opencopilot-h-7 opencopilot-w-7 opencopilot-rounded-lg opencopilot-shrink-0 opencopilot-object-cover opencopilot-aspect-square hover:opencopilot-shadow",
        error && "border opencopilot-border-rose-500 opencopilot-shadow-none"
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
        <div className="opencopilot-rounded-lg opencopilot-shrink-0 opencopilot-bg-accent opencopilot-h-7 opencopilot-w-7 opencopilot-object-cover opencopilot-aspect-square hover:opencopilot-shadow opencopilot-border-primary-light opencopilot-border opencopilot-flex opencopilot-items-center opencopilot-justify-center">
          <span className="opencopilot-text-xl opencopilot-text-primary opencopilot-fill-current">
            <User />
          </span>
        </div>
      </TooltipTrigger>
    </Tooltip>
  );
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
  const { displayText } = useTypeWriter({
    text: message,
    every: 0.0001,
    shouldStart: true,
  });
  const [copied, copy] = useCopyToClipboard();
  const { messages } = useChat();
  const isLast = getLast(messages)?.id === id;
  return (
    <div className="opencopilot-p-2 group opencopilot-w-full opencopilot-shrink-0">
      <div
        className="opencopilot-flex opencopilot-select-none opencopilot-items-start opencopilot-gap-3 opencopilot-w-full"
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
                {displayText}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      {isLast && (
        <div className="opencopilot-w-full opencopilot-ps-10 opencopilot-flex opencopilot-items-center opencopilot-justify-between">
          <div>
            {timestamp && (
              <span className="opencopilot-text-xs opencopilot-m-0">
                Bot · {format(timestamp)}
              </span>
            )}
          </div>
          <button
            className="opencopilot-text-lg opencopilot-justify-self-end"
            onClick={() => copy(displayText)}
          >
            {copied ? (
              <ClipboardCheck className="opencopilot-text-emerald-500" />
            ) : (
              <Clipboard />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// this hook swaps the texts aarray in order every n seconds to display the next text
// when the last text is reached, it stops 
const waitingText = [
  "The copilot is thinking...",
  "Checking if we need to proceed with external call...",
  "Crunching some numbers...",
  "Almost there...",
]

export function BotMessageLoading() {
  const displayText = useTextRotator({ texts: waitingText, intervalInSeconds: 2 })

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
        <div className="mesg_body opencopilot-w-fit opencopilot-max-w-full">
          {
            displayText.map(({ isVisible, order, text }) => (
              <p data-visible={isVisible} key={order} className="opencopilot-text-sm 
              opencopilot-lowercase 
              data-[visible=false]:!opencopilot-hidden 
              opencopilot-fade-in data-[visible=false]:opencopilot-fade-out 
              data-[visible=false]:opencopilot-animate-out 
              opencopilot-animate-in">
                {text}
              </p>
            ))
          }
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
