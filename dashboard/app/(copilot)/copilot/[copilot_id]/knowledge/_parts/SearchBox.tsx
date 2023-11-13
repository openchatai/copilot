"use client";
import React, { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchIcon, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHotkeys } from "react-hotkeys-hook";
import _ from "lodash";
import { searchQuery, searchQueryAtom } from "./searchAtom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SearchBox() {
  const [search, setSearchQuery] = useAtom(searchQuery);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const query = useAtomValue(searchQueryAtom);
  console.log(query);
  useHotkeys("/", (ev) => {
    ev.preventDefault();
    searchInputRef.current?.focus();
  });
  return (
    <HoverCard
      open={focused && !_.isEmpty(query.filters)}
      onOpenChange={(open) => {
        if (!open) setFocused(false);
      }}
    >
      <HoverCardTrigger asChild>
        <div className="relative flex max-w-md flex-1 items-center gap-4">
          <Label
            htmlFor="search-copilots"
            className="flex-center absolute left-2 h-full"
          >
            {_.isEmpty(search) ? (
              <SearchIcon className="h-4 w-4 opacity-50 animate-in fade-in" />
            ) : (
              <X
                className="h-4 w-4 opacity-50 animate-in fade-in"
                role="button"
                onClick={() => setSearchQuery("")}
              />
            )}
          </Label>
          <TooltipProvider disableHoverableContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  onFocus={() => setFocused(true)}
                  ref={searchInputRef}
                  value={search}
                  onChange={_.throttle(
                    (ev) => setSearchQuery(ev.target.value),
                    200,
                  )}
                  type="text"
                  className="pl-9"
                  id="search-copilots"
                  placeholder="Search Knowleadge Data..."
                />
              </TooltipTrigger>
              <TooltipContent>
                Press <span className="px-1 text-white">/</span> to search
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        animated={false}
        className="min-w-[var(--radix-hover-card-trigger-width)] p-2"
      >
        <div>
          <div className="flex items-center gap-1">
            {query.filters.map(({ key, v, allowed }, i) => (
              <div
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-0.5 text-sm",
                  allowed
                    ? "bg-accent text-accent-foreground"
                    : "bg-rose-500 text-rose-100",
                )}
                key={i}
              >
                <span className="font-semibold">{key}:</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-full justify-end">
          <Button variant="link" size="sm" className="p-0 text-xs">
            search syntax
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
