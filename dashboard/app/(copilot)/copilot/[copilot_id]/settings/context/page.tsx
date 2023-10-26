"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { HeaderShell } from "@/components/domain/HeaderShell";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Popover,
  PopoverContentPrimitive,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AlertCircle } from "lucide-react";
import { contexts } from "./_parts/data/contexts";
import { TextDisplay } from "@/components/headless/TextDisplay";
import { updateCopilot } from "@/data/copilot";
import { useCopilot } from "../../../_context/CopilotProvider";
import { toast } from "@/components/ui/use-toast";
import { mutate } from "swr";
export default function CopilotContextSettingsPage() {
  const { id: copilotId, name: copilotName, prompt_message } = useCopilot();
  const [context, setContext] = React.useState(prompt_message);
  async function handleUpdateContext() {
    const { status } = await updateCopilot(copilotId, {
      prompt_message: context,
      // [ "The name field is required." ]
      name: copilotName,
    });
    if (status === 200) {
      toast({
        title: "Context updated successfully",
        variant: "success",
      });
      mutate(copilotId);
    } else {
      toast({
        title: "Failed to update context",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <HeaderShell className="items-center justify-between">
        <h1 className="text-lg font-bold text-secondary-foreground">Context</h1>
        <div className="space-x-2">
          <Button size="sm" onClick={handleUpdateContext}>
            Save
          </Button>
        </div>
      </HeaderShell>

      <div className="flex flex-1 overflow-hidden bg-accent/25">
        <div className="h-full w-full max-w-screen-sm flex-1 space-y-10 px-4 py-8">
          <div>
            <Popover modal={false}>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-base font-bold text-accent-foreground">
                  Context
                </Label>
                <PopoverTrigger>
                  <AlertCircle className="h-5 w-5 text-accent-foreground" />
                </PopoverTrigger>
              </div>
              <Textarea
                minRows={3}
                maxRows={8}
                className="leading-relaxed"
                value={context}
                onChange={(e) => {
                  setContext(e.target.value);
                }}
              />
              <PopoverContentPrimitive
                asChild
                side="right"
                align="start"
                sideOffset={10}
                className="z-[100] max-w-md"
              >
                <Alert variant="default">
                  <AlertTitle>What is base context ?</AlertTitle>
                  <AlertDescription>
                    The context is Lorem ipsum dolor, sit amet consectetur
                    adipisicing elit. Laboriosam unde ea, ullam quae velit
                    provident quo quisquam ducimus nisi repudiandae perferendis
                    aliquam nihil voluptatibus, quam perspiciatis pariatur
                    debitis. Laudantium, ut!
                  </AlertDescription>
                </Alert>
              </PopoverContentPrimitive>
            </Popover>
            <span className="my-5 block text-sm">
              Or you can select one of the following contexts
            </span>
          </div>
        </div>
        <div className="h-full flex-1 overflow-auto px-4 py-8">
          <div className="mt-2 space-y-2">
            {contexts.map((context) => (
              <Alert key={context.id} className="transition-all">
                <div className="flex flex-col space-y-1">
                  <AlertTitle className="text-lg font-semibold">
                    {context.name}
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground">
                    <TextDisplay text={context.content} wordCount={20} />
                  </AlertDescription>
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setContext(context.content);
                    }}
                  >
                    Select
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
