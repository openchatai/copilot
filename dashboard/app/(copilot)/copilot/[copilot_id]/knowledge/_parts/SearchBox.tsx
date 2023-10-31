"use client";
import React from "react";
import { atom, useAtom } from "jotai";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHotkeys } from "react-hotkeys-hook";
export const searchQueryAtom = atom("");
export function SearchBox() {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  useHotkeys("/", (ev) => {
    ev.preventDefault();
    searchInputRef.current?.focus();
  });
  return (
    <div className="flex flex-1 items-center gap-1">
      <Label htmlFor="search-copilots">
        <SearchIcon className="h-5 w-5 opacity-50" />
      </Label>
      <TooltipProvider disableHoverableContent>
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value.trim());
              }}
              type="text"
              id="search-copilots"
              className="max-w-xs flex-1 border-none font-medium shadow-none focus-visible:!ring-transparent"
              placeholder="Search Copilots..."
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
