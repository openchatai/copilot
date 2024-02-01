"use client";
import { ChevronDown } from "lucide-react";

import {
  SelectTrigger,
  Icon as SelectPrimitiveIcon,
} from "@radix-ui/react-select";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function SelectWorkspace() {
  return (
    <Select value="default" disabled>
      <SelectTrigger className="w-full h-full outline-none flex items-center justify-between px-4 hover:bg-card-foreground font-semibold">
        <SelectValue placeholder="Select a workspace" />
        <SelectPrimitiveIcon asChild>
          <ChevronDown className="h-5 w-5 opacity-50" />
        </SelectPrimitiveIcon>
      </SelectTrigger>
      <SelectContent className="p-0">
        <SelectGroup>
          <SelectLabel>Workspaces</SelectLabel>
          <SelectItem value="default">Default Workspace</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <Button variant="default" className="w-full">
            create workspace
          </Button>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
