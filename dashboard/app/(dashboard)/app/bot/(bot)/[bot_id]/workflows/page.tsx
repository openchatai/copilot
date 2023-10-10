import Alert from "@/ui/components/Alert";
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
import { Link } from "@/ui/router-events";
import { getWorkflowsByBotId } from "api/flows";
import React from "react";
import { BiPencil, BiSearch, BiTrash } from "react-icons/bi";
import { BsChevronLeft, BsChevronRight, BsExclamation } from "react-icons/bs";
import { LuWorkflow } from "react-icons/lu";

export default async function Workflows({
  params: { bot_id },
}: {
  params: {
    bot_id: string;
  };
}) {
  const { data: workflows } = await getWorkflowsByBotId(bot_id);
  console.log(workflows.workflows);
  return (
    <div className="flex items-start flex-col max-w-screen-xl mx-auto w-full h-full overflow-hidden">
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
            asChild
            variant={{
              intent: "primary",
            }}
          >
            <Link href={`/app/bot/${bot_id}/workflow/new`}>Create New</Link>
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
        <div className="w-full space-y-2 overflow-auto">
          {workflows.workflows.map((_, i) => (
            <CardWrapper
              key={i}
              className="shadow-sm border select-none hover:border-indigo-500 group"
            >
              <div className="w-full flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <LuWorkflow className="text-2xl group-hover:text-indigo-500" />
                  <h2 className="line-clamp-1">{_.info.title}</h2>
                </div>
                <div className="actions flex items-center gap-2 ms-auto">
                  <Button
                    variant={{ intent: "primary-ghost" }}
                    className="shadow-none"
                    asChild
                  >
                    <Link href={`/app/bot/${bot_id}/workflow/${_._id.$oid}`}>
                      <BiPencil />
                    </Link>
                  </Button>
                  <Alert
                    trigger={
                      <Button
                        variant={{ intent: "danger-ghost" }}
                        className="shadow-none"
                      >
                        <BiTrash />
                      </Button>
                    }
                    type="danger"
                    action={<></>}
                    title="Delete workflow"
                  >
                    Are you sure you want to delete this workflow?
                  </Alert>
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
                        Add a pet called luna and place order for her 3 days
                        from now
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardWrapper>
          ))}
        </div>

        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-5">
            <div className="flex items-center space-x-2">
              <Button variant={{ intent: "icon" }} className="h-8 w-8 p-0">
                <span className="sr-only">Go to previous page</span>
                <BsChevronLeft className="h-4 w-4" />
              </Button>
              <div className="space-x-0.5">
                <Button variant={{ intent: "icon" }} className="h-8 w-8 p-0">
                  1
                </Button>
                <Button variant={{ intent: "icon" }} className="h-8 w-8 p-0">
                  2
                </Button>
                <Button variant={{ intent: "icon" }} className="h-8 w-8 p-0">
                  3
                </Button>
                <Button variant={{ intent: "icon" }} className="h-8 w-8 p-0">
                  ...
                </Button>
              </div>
              <Button variant={{ intent: "icon" }} className="h-8 w-8 p-0">
                <span className="sr-only">Go to next page</span>
                <BsChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
