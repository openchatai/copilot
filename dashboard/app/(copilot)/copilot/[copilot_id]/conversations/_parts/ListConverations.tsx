"use client";
import { useAtom } from "jotai";
import { activeSessionId } from "./atoms";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { useCopilot } from "../../../_context/CopilotProvider";
import { ConversationType, getSessionsByBotId } from "@/data/conversations";
import { format } from 'timeago.js';
import _ from "lodash";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import Loader from "@/components/ui/Loader";
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
        className="h-full w-full text-start">
        <p className="line-clamp-1 text-base">{props.first_message.message}</p>
        <p className="text-[10px]">{format(props.first_message.created_at)}</p>
      </div>
    </li>
  );
}

export function ListConversations() {
  const {
    id: copilotId,
  } = useCopilot();
  const {
    data: conversations,
    isLoading
  } = useSWR(copilotId + "/conversations", async () => (await getSessionsByBotId(copilotId))?.data, {
    refreshInterval: 5000,
  })
  return (
    <div className="w-full flex-1 overflow-hidden">
      <ul className="h-full overflow-auto">
        {isLoading ? <Loader /> :
          _.isEmpty(conversations) ? <EmptyBlock>
            No conversations yet
          </EmptyBlock> : conversations?.map((c, i) => (
            <Conversation {...c} key={i} />
          ))
        }
      </ul>
    </div>
  );
}
