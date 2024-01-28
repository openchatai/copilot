'use client';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAtomValue } from "jotai";
import { activeSessionId } from "./atoms";
import useSWR from "swr";
import { ChatMessageType, getConversationBySessionId } from "@/data/conversations";
import Loader from "@/components/ui/Loader";
import { format } from 'timeago.js';
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import { BaseCodeBlock } from "@/components/domain/CodeBlock";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertCircle } from "lucide-react";

function UserMessage({ message, created_at }: ChatMessageType) {
  return (
    <div className="flex w-full flex-row items-center justify-end gap-2">
      <div className="flex flex-col items-end">
        <p className="w-fit max-w-sm rounded-lg bg-primary px-4 py-3 text-sm select-none text-white">
          {message}
        </p>
        <span className="text-xs">
          {format(created_at)}
        </span>
      </div>
    </div>
  );
}

function CopilotMessage({ message, created_at, debug_json }: ChatMessageType) {
  return (
    <div className="flex w-full flex-row items-start justify-start gap-2 relative">
      <Avatar size="large" className="sticky top-0">
        <AvatarFallback>C</AvatarFallback>
      </Avatar>
      <div className="flex items-start flex-col gap-1.5">
        <p className="w-fit max-w-sm rounded-lg bg-secondary px-4 py-3 text-sm text-accent-foreground select-none">
          {message}
        </p>
        <div>
        </div>
        <div className="flex items-center justify-between w-full gap-5">
          <span className="text-xs">{format(created_at)}</span>
          {
            debug_json &&
            <Popover>
              <PopoverTrigger className="self-center">
                <AlertCircle className="size-5" />
              </PopoverTrigger>
              <PopoverContent side="right" align="center" className="w-fit max-w-sm p-0 overflow-hidden">
                <BaseCodeBlock code={JSON.stringify(debug_json) || "{}"} language="javascript" />
              </PopoverContent>
            </Popover>
          }
        </div>
      </div>

    </div>
  );
}
function ChatDivider({ content }: { content: string }) {
  return (
    <div className="relative my-4 block h-px w-full bg-secondary">
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs">
        {content}
      </span>
    </div>
  );
}
function LoadModeChatsDivider({
  onClick
}: { onClick: () => void }) {
  return (
    <div className="relative my-4 block h-px w-full bg-secondary">
      <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs">
        Load more
      </button>
    </div>
  );
}

export function ChatScreen() {
  const activeId = useAtomValue(activeSessionId);
  const {
    data: chat,
    isLoading
  } = useSWR(activeId, getConversationBySessionId)

  return (
    <div className="flex-1 space-y-3 overflow-auto p-4 font-medium">
      {
        isLoading && <Loader className="h-full flex-center" />
      }
      {
        chat ? chat?.data.map((c, i) => {
          if (c.from_user) {
            return <UserMessage key={i} {...c} />
          } else if (!c.from_user) {
            return <CopilotMessage key={i} {...c} />
          }
        }) : <EmptyBlock>
          <p className="text-center text-sm">
            Select a conversation to start chatting
          </p>
        </EmptyBlock>
      }
    </div>
  );
}
