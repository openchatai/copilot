"use client";
import React from "react";
import { useAtom } from "jotai";
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
import { searchQueryAtom } from "./searchAtom";

export function SearchBox() {
  const [search, setSearchQuery] = useAtom(searchQueryAtom);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  useHotkeys("/", (ev) => {
    ev.preventDefault();
    searchInputRef.current?.focus();
  });
  return (
    <div className="relative flex flex-1 items-center gap-4">
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
  );
}
