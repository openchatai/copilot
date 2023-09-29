import { Button } from "@/ui/components/Button";
import { Heading } from "@/ui/components/Heading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/components/ToolTip";
import { Input } from "@/ui/components/inputs/BaseInput";
import { CardWrapper } from "@/ui/components/wrappers/CardWrapper";
import EmptyState from "@/ui/partials/EmptyState";
import React from "react";
import { BiPencil, BiSearch, BiTrash } from "react-icons/bi";
import { BsExclamation } from "react-icons/bs";
import { FcWorkflow } from "react-icons/fc";
import { LuWorkflow } from "react-icons/lu";

export default function Workflows() {
  return (
    <div className="flex items-start flex-col max-w-screen-xl mx-auto">
      <div className="w-full">
        <div className="flex items-center justify-between w-full">
          <div>
            <Heading className="font-semibold" level={3}>
              Workflows ✨
            </Heading>
            <p className="text-sm">
              Workflows are set of API calls that are executed in a sequence to
              do some task.
            </p>
          </div>
          <Button
            variant={{
              intent: "primary",
            }}
          >
            Create New
          </Button>
        </div>
        <div className="w-full mt-4 flex items-center justify-between">
          <Input className="py-3 text-base" placeholder="search..." suffix={<BiSearch />} prefixSuffixClassName="p-3 shadow-inset" />
        </div>
      </div>

      <div className="flex-1 w-full py-4">
        <EmptyState
          className="p-5 hidden"
          label="No workflows found"
          description="Create a workflow to get started."
        />
        <div className="w-full">
          <CardWrapper className="shadow-sm border hover:border-indigo-500 group">
            <div className="w-full flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <LuWorkflow className="text-2xl group-hover:text-indigo-500" />
                <h2 className="line-clamp-1">Add a pet</h2>
              </div>
              <div className="actions flex items-center gap-2 ms-auto">
                <Button
                  variant={{ intent: "primary-ghost" }}
                  className="shadow-none"
                >
                  <BiPencil />
                </Button>
                <Button
                  variant={{ intent: "danger-ghost" }}
                  className="shadow-none"
                >
                  <BiTrash />
                </Button>
              </div>
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="rounded-full !border-yellow-500 border text-yellow-500 text-3xl"
                        variant={{
                          intent: "base",
                        }}
                      >
                        <BsExclamation />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      Add a pet called luna and place order for her 3 days from
                      now
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardWrapper>
        </div>
      </div>
    </div>
  );
}
