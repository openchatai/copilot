"use client";

import { useAtom } from "jotai";
import { activeConversationId } from "./atoms";
import { cn } from "@/lib/utils";

function Conversation(props: {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime: string;
}) {
  const [activeid, setActiveId] = useAtom(activeConversationId);
  const isActive = activeid === props.id;
  return (
    <li
      className={cn(
        "w-full border border-l-[3px] border-border p-4 transition-colors last-of-type:mb-2",
        isActive
          ? "sticky bottom-0 left-0 top-0 border-l-primary bg-accent"
          : "border-x-transparent bg-white",
      )}
    >
      <button
        className="h-full w-full text-start text-xs"
        onClick={() => setActiveId(props.id)}
      >
        <h3 className="text-sm font-medium">{props.name}</h3>
        <p className="line-clamp-1">{props.lastMessage}</p>
        <span>{props.lastMessageTime}</span>
      </button>
    </li>
  );
}
const conversations = [
  {
    id: "1",
    lastMessageTime: "1:00 PM . Tue",
    name: "John Doe",
    lastMessage: "Hello, how are you doing today?",
  },
  {
    id: "2",
    lastMessageTime: "2:00 PM . Wen",
    name: "Falta",
    lastMessage: "Hola como estas?",
  },
  {
    id: "3",
    lastMessageTime: "1:00 PM . Tue",
    name: "John Doe",
    lastMessage: "Hello, how are you doing today?",
  },
  {
    id: "4",
    lastMessageTime: "2:00 PM . Wen",
    name: "Falta",
    lastMessage: "Hola como estas?",
  },
  {
    id: "5",
    lastMessageTime: "2:00 PM . Wen",
    name: "Falta",
    lastMessage: "Hola como estas?",
  },
  {
    id: "6",
    lastMessageTime: "1:00 PM . Tue",
    name: "John Doe",
    lastMessage: "Hello, how are you doing today?",
  },
  {
    id: "7",
    lastMessageTime: "2:00 PM . Wen",
    name: "Falta",
    lastMessage: "Hola como estas?",
  },
  {
    id: "8",
    lastMessageTime: "2:00 PM . Wen",
    name: "Falta",
    lastMessage: "Hola como estas?",
  },
  {
    id: "9",
    lastMessageTime: "1:00 PM . Tue",
    name: "John Doe",
    lastMessage: "Hello, how are you doing today?",
  },
  {
    id: "10",
    lastMessageTime: "2:00 PM . Wen",
    name: "Falta",
    lastMessage: "Hola como estas?",
  },
];
export function ListConversations() {
  return (
    <div className="w-full flex-1 overflow-hidden">
      <ul className="h-full overflow-auto">
        {conversations.map((c, i) => (
          <Conversation {...c} key={i} />
        ))}
      </ul>
    </div>
  );
}
