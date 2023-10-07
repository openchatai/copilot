"use client";
import { Button } from "@/ui/components/Button";
import { Heading } from "@/ui/components/Heading";
import { Input } from "@/ui/components/inputs/BaseInput";
import EmptyState from "@/ui/partials/EmptyState";
import { useMemo, useState } from "react";
import { BiSearch } from "react-icons/bi";

function useSearchWithFilters() {
  const [input, setInput] = useState("");
  function onChange(ev: React.ChangeEvent<HTMLInputElement>) {
    setInput(ev.target.value);
  }
  const searchQuery = useMemo(() => {
    const groupRegex = /is:([a-z]+)/g;
    const groups = input.match(groupRegex);
    const query = input.replace(groupRegex, "");
    let result = {
      groups: [] as { name: string; value: string }[],
      query,
    };
    if (groups) {
      const $groups = groups.map((group) => ({
        name: group.split(":")[0],
        value: group.replace("is:", ""),
      }));
      result.groups = $groups;
    }
    return result;
  }, [input]);
  return [input, onChange, searchQuery] as const;
}

export default function SwaggerPage() {
  return (
    <div className="flex items-start flex-col max-w-screen-xl mx-auto">
      <div className="w-full">
        <div className="flex items-center justify-between w-full">
          <div>
            <Heading className="font-semibold" level={3}>
              Swagger Files ✨
            </Heading>
          </div>
          <Button
            variant={{
              intent: "primary",
            }}
          >
            Add new
          </Button>
        </div>
        <div className="w-full mt-4 flex items-center justify-between">
          <Input
            className="py-3 text-base"
            placeholder="search..."
            suffix={<BiSearch />}
            prefixSuffixClassName="p-3 shadow-inset"
          />
        </div>
      </div>

      <div className="flex-1 w-full py-4">
        <EmptyState
          className="p-5 hidden"
          label="No workflows found"
          description="Create a workflow to get started."
        />
        <div className="w-full space-y-2">
          {/* list of swagger files and methods in tree view */}
        </div>
      </div>
    </div>
  );
}
