"use client";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { SelectTrigger } from "@radix-ui/react-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Search, BotIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function CopilotCard() {
  return (
    <div className="xl:aspect-square">
      <div className="rounded-lg relative h-56 border bg-secondary shadow-sm flex items-center justify-center p-5 group">
        <div className="inset-0 absolute backdrop-blur-sm bg-accent-alt/50 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <div className="h-full w-full gap-2 flex items-center justify-center">
            <Button size="lg">Edit</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" variant="secondary">
                  ...
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div>
          <div className="h-20 grid place-content-center aspect-square rounded-lg bg-slate-950 text-gray-100">
            <BotIcon className="h-12 w-12" />
          </div>
        </div>
      </div>
      <div className="mt-1.5 ps-1">
        <h2 className="text-sm font-semibold whitespace-nowrap line-clamp-1 text-ellipsis">
          Copilot 1
        </h2>
        <p className="text-xs text-gray-400">Created 2 days ago</p>
      </div>
    </div>
  );
}

// list copilots
export default function Home() {
  return (
    <div className="flex-1 p-8 pt-4 overflow-auto">
      <div className="w-full flex items-center gap-5 justify-between">
        <div className="flex items-center gap-1 flex-1">
          <Label htmlFor="search-copilots">
            <Search className="h-5 w-5 opacity-50" />
            {/* <X className="h-5 w-5 opacity-50" /> */}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Input
                  id="search-copilots"
                  className="border-none focus-visible:!ring-transparent font-medium"
                  placeholder="Search Copilots..."
                />
              </TooltipTrigger>
              <TooltipContent>Press <i className="text-white px-1">/</i> to search</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Select defaultValue="last-viewed">
          <SelectTrigger className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="py-2" value="last-viewed">
              Last Viewed
            </SelectItem>
            <SelectItem className="py-2" value="date-created">
              Date Created
            </SelectItem>
            <SelectItem className="py-2" value="alphapetically">
              Alphapetically
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid xl:grid-cols-4 grid-cols-2 gap-8 py-4">
        <CopilotCard />
        <CopilotCard />
        <CopilotCard />
        <CopilotCard />
        <CopilotCard />
        <CopilotCard />
      </div>
    </div>
  );
}
