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
import { HeaderShell } from "./parts/Header";
import {
  ClosableDiv,
  ClosableDivProvider,
  CloseBtn,
} from "@/components/headless/ClosableDiv";
import { CopilotCardSmall } from "@/components/domain/CopilotCardSmall";

// list copilots
export default function Home() {
  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      <HeaderShell>
        <div className="flex-1 flex items-center justify-between">
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

      <div className="flex-1 p-8 pt-4 overflow-auto">
        <ClosableDivProvider>
          <ClosableDiv className="group w-full relative rounded-lg mb-2 bg-primary/20 overflow-hidden py-6 px-8 before:opacity-60 before:absolute before:bg-[url('/rocket_silver.svg')] before:bg-no-repeat before:w-auto before:aspect-square before:h-full before:right-14 before:-bottom-5 before:-rotate-45 before:-z-10">
            <div className="flex items-center justify-between gap-5">
              <div>
                <h1 className="text-accent-foreground font-bold text-lg">
                  Learn Opencopilot with video tutorials
                </h1>
                <p>
                  In this course you’ll find everything you need to get started
                  with Opencopilot from the ground up.
                </p>
              </div>
              <Button>Get it</Button>
            </div>
            <CloseBtn className="opacity-0 rounded-full bg-white p-1 shadow group-hover:opacity-100 absolute -right-1 -top-1 border-border border ">
              <XIcon className="h-4 w-4" />
            </CloseBtn>
          </ClosableDiv>
        </ClosableDivProvider>
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
                <TooltipContent>
                  Press <span className="text-white px-1">/</span> to search
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
        <div className="grid xl:grid-cols-4 grid-cols-2 gap-8 py-4">
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
