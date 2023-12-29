"use client";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectTrigger } from "@radix-ui/react-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { atom, useAtom } from "jotai";
import { DebounceInput } from "react-debounce-input";

const sortFilter = [
  { label: "Last Viewed", value: "last-viewed" },
  { label: "Date Created", value: "date-created" },
  { label: "Alphapetically", value: "alphapetically" },
  { label: "None", value: "none" },
] as const;

export type Filter = {
  query: string;
  sort: (typeof sortFilter)[number]["value"];
};
export const filterAtom = atom<Filter>({
  query: "",
  sort: "none",
});
export const QUERY_KEY = "q";
export const SORT_KEY = "sort";
export function Search() {
  const [filter, setFilter] = useAtom(filterAtom);

  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div className="flex-1 max-w-md relative">
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
          className="font-medium rounded-none border-x-0 ps-8 border-t-0 border-b shadow-none focus-visible:!ring-transparent"
          placeholder="Search Copilots..."
        />
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
