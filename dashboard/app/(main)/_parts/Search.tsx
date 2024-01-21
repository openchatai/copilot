"use client";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { atom, useAtom } from "jotai";
import { DebounceInput } from "react-debounce-input";
import { useId } from "react";

export type Filter = {
  query: string;
};

export const filterAtom = atom<Filter>({
  query: "",
});

export const QUERY_KEY = "q";
export const SORT_KEY = "sort";
export function Search() {
  const [filter, setFilter] = useAtom(filterAtom);
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div className="flex-1 max-w-lg relative">
        <Label htmlFor="search-copilots" className="absolute left-2 top-1/2 -translate-y-1/2">
          <SearchIcon className="h-5 w-5 opacity-50" />
        </Label>
        <DebounceInput
          // @ts-ignore
          element={Input}
          debounceTimeout={300}
          value={filter.query}
          type="text"
          onChange={(event) => {
            setFilter((prev) => {
              return {
                ...prev,
                query: event.target.value.trim(),
              };
            });
          }}
          id="search-copilots"
          list="search-copilots-list"
          className="font-medium ps-8 placeholder:text-xs focus-visible:!ring-transparent"
          placeholder="Search Copilots..."
        />
      </div>
    </div>
  );
}
