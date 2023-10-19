"use client";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectTrigger } from "@radix-ui/react-select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
const sortFilter = [
  { label: "Last Viewed", value: "last-viewed" },
  { label: "Date Created", value: "date-created" },
  { label: "Alphapetically", value: "alphapetically" },
] as const;

export type Filter = {
  query: string;
  sort: (typeof sortFilter)[number]["value"];
};
export const QUERY_KEY = "q";
export const SORT_KEY = "sort";
export function Search() {
  const searchImputRef = React.useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  useHotkeys("/", (ev) => {
    ev.preventDefault();
    searchImputRef.current?.focus();
  });
  const [filter, setFilter] = React.useState<Filter>({
    query: searchParams.get(QUERY_KEY) ?? "",
    sort: (searchParams.get(SORT_KEY) ?? "last-viewed") as Filter["sort"],
  });
  const { replace } = useRouter();
  useEffect(() => {
    // to not to override other params
    const params = new URLSearchParams(searchParams);
    if (filter) {
      params.set(QUERY_KEY, filter.query);
      params.set(SORT_KEY, filter.sort);
    }
    replace(`/?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, searchParams]);
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div className="flex flex-1 items-center gap-1">
        <Label htmlFor="search-copilots">
          <SearchIcon className="h-5 w-5 opacity-50" />
          {/* <X className="h-5 w-5 opacity-50" /> */}
        </Label>
        <TooltipProvider disableHoverableContent>
          <Tooltip>
            <TooltipTrigger>
              <Input
                value={filter.query}
                type="text"
                onChange={(event) => {
                  setFilter((prev) => {
                    return {
                      ...prev,
                      query: event.target.value,
                    };
                  });
                }}
                ref={searchImputRef}
                id="search-copilots"
                className="border-none font-medium shadow-none focus-visible:!ring-transparent"
                placeholder="Search Copilots..."
              />
            </TooltipTrigger>
            <TooltipContent>
              Press <span className="px-1 text-white">/</span> to search
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Select
        defaultValue={filter.sort}
        onValueChange={(v) =>
          setFilter({
            ...filter,
            sort: v as Filter["sort"],
          })
        }
      >
        <SelectTrigger className="text-sm font-semibold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortFilter.map((item) => (
            <SelectItem className="py-2" key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
