"use client";
import { useAtom } from "jotai";
import { activeSessionId, conversationsPageNum } from "./atoms";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { useCopilot } from "../../../CopilotProvider";
import { ConversationType, getSessionsByBotId } from "@/data/conversations";
import { format } from 'timeago.js';
import _ from "lodash";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import Loader from "@/components/ui/Loader";
import { SimplePagination } from "@/components/domain/SimplePagination";

function Conversation(props: ConversationType) {
  const [activeid, setActiveId] = useAtom(activeSessionId);
  const isActive = activeid === props.session_id;
  return (
    <li
      onClick={() => setActiveId(props.session_id)}
      role="button"
      className={cn(
        "w-full border border-l-[3px] p-4 transition-colors last-of-type:mb-2",
        isActive
          ? "sticky bottom-0 left-0 top-0 !border-l-primary bg-accent"
          : "border-x-transparent bg-white border-border",
      )}
    >
      <div
        className="h-full w-full">
        <p className="line-clamp-1 text-base text-start"
          dir="auto"
        >{props.first_message.message}</p>
        <p className="text-[10px]">started{" "}{format(props.first_message.created_at)}</p>
      </div>
    </li>
  );
}

export function ListConversations() {
  const {
    id: copilotId,
  } = useCopilot();

  const [
    pageNum,
    setConversationsPageNum,
  ] = useAtom(conversationsPageNum);

  const {
    data: conversations,
    isLoading
  } = useSWR(copilotId + "/conversations/" + pageNum, async () => (await getSessionsByBotId(copilotId, pageNum))?.data, {
    refreshInterval: 5000,
  })
  const totalPages = conversations?.total_pages || 1;
  const isNext = pageNum < totalPages;
  return (
    <div className="w-full flex-1 overflow-hidden">
      <ul className="h-full overflow-auto">
        {isLoading ? <Loader className="mx-auto p-4" /> :
          _.isEmpty(conversations) ? <EmptyBlock>
            No conversations yet
          </EmptyBlock> : conversations.data.map((c, i) => (
            <Conversation {...c} key={i} />
          ))
        }
        <div className="p-4">
          <SimplePagination
            isBack={pageNum > 1}
            isNext={isNext}
            onNext={() => setConversationsPageNum(pageNum + 1)}
            onBack={() => setConversationsPageNum(pageNum - 1)}
          />
        </div>
      </ul>
    </div>
  );
}
