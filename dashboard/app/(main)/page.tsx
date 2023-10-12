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
import { Search, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ClosableDiv,
  ClosableDivProvider,
  CloseBtn,
} from "@/components/headless/ClosableDiv";
import { CopilotCardSmall } from "@/components/domain/CopilotCardSmall";
import { HeaderShell } from "@/components/domain/HeaderShell";

// list copilots
export default function Home() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <HeaderShell>
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-accent-foreground">
              All Copilots
            </h1>
          </div>
          <div className="space-x-2">
            <Button variant="secondary">Invite</Button>
            <Button>Create Copilot</Button>
          </div>
        </div>
      </HeaderShell>

      <div className="flex-1 overflow-auto p-8 pt-4">
        <ClosableDivProvider>
          <ClosableDiv className="group relative mb-2 w-full overflow-hidden rounded-lg bg-primary/20 px-8 py-6 before:absolute before:-bottom-5 before:right-14 before:-z-10 before:aspect-square before:h-full before:w-auto before:-rotate-45 before:bg-[url('/rocket_silver.svg')] before:bg-no-repeat before:opacity-60">
            <div className="flex items-center justify-between gap-5">
              <div>
                <h1 className="text-lg font-bold text-accent-foreground">
                  Learn Opencopilot with video tutorials
                </h1>
                <p>
                  In this course you’ll find everything you need to get started
                  with Opencopilot from the ground up.
                </p>
              </div>
              <Button>Get it</Button>
            </div>
            <CloseBtn className="absolute -right-1 -top-1 rounded-full border border-border bg-white p-1 opacity-0 shadow group-hover:opacity-100 ">
              <XIcon className="h-4 w-4" />
            </CloseBtn>
          </ClosableDiv>
        </ClosableDivProvider>

        <div className="py-5 flex items-center justify-between gap-5">
          <div className="flex flex-1 items-center gap-1">
            <Label htmlFor="search-copilots">
              <Search className="h-5 w-5 opacity-50" />
              {/* <X className="h-5 w-5 opacity-50" /> */}
            </Label>
            <TooltipProvider disableHoverableContent>
              <Tooltip>
                <TooltipTrigger>
                  <Input
                    id="search-copilots"
                    className="border-none font-medium focus-visible:!ring-transparent"
                    placeholder="Search Copilots..."
                  />
                </TooltipTrigger>
                <TooltipContent>
                  Press <span className="px-1 text-white">/</span> to search
                </TooltipContent>
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
        <div className="grid grid-cols-2 gap-8 py-4 xl:grid-cols-4">
          <CopilotCardSmall />
          <CopilotCardSmall />
          <CopilotCardSmall />
          <CopilotCardSmall />
          <CopilotCardSmall />
        </div>
      </div>
    </div>
  );
}
