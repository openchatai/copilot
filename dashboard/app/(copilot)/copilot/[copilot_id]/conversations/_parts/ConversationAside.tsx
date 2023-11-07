"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bookmark, CheckCircle, Trash2 } from "lucide-react";

export function ConversationAside() {
  return (
    <aside className="h-full w-full max-w-xs border-l border-border">
      <section className="border-y border-border">
        <div className="px-4 py-8 text-center">
          <div className="flex-center -space-x-2">
            <Avatar size="large">
              <AvatarFallback className="bg-accent-foreground text-white">
                AH
              </AvatarFallback>
            </Avatar>
            <Avatar size="large">
              <AvatarFallback className="bg-accent">CO</AvatarFallback>
            </Avatar>
          </div>
          <h2 className="mt-2 text-sm font-semibold">
            Conversation between your assistant and Ahmad Falta
          </h2>
        </div>
      </section>
      <section className="border-y border-border bg-white">
        <div className="p-4">
          <span className="text-xs font-semibold uppercase text-secondary-foreground">
            actions
          </span>
          <div className="mt-2 w-full space-y-2 text-accent-foreground/80 ">
            <button className="flex w-full items-center justify-between px-1 py-2 text-sm">
              <span className="text-xs font-semibold">Mark as Reviewed</span>
              <CheckCircle className="h-4 w-4" />
            </button>
            <button className="flex w-full items-center justify-between px-1 py-2 text-sm">
              <span className="text-xs font-semibold">Save for Later</span>
              <Bookmark className="h-4 w-4" />
            </button>
            <button className="flex w-full items-center justify-between px-1 py-2 text-sm text-destructive">
              <span className="text-xs font-semibold">Delete </span>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </aside>
  );
}
