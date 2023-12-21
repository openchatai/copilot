"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createFlowByBotId } from "@/data/new_flows";
import { useAsyncFn } from "react-use";
import { toast } from "@/components/ui/use-toast";
import { atom, useAtom } from "jotai";
import { useRouter } from "@/lib/router-events";
import { useCopilot } from "@/app/(copilot)/copilot/_context/CopilotProvider";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "title must be at least 2 characters."
  }),
  description: z.string().min(2, {
    message: "description must be at least 2 characters."
  })
});

const modalAtom = atom(false);
const useModal = () => useAtom(modalAtom);

export default function CreateWorkflowForm() {
  const { id: copilotId } = useCopilot();
  const [open, setOpen] = useModal();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });
  const [state, createFlow] = useAsyncFn(createFlowByBotId);

  const { push } = useRouter();

  async function onSubmit({ name, description }: z.infer<typeof formSchema>) {
    const { data } = await createFlow(copilotId, { name, description });
    if (data.flow_id) {
      push(`/copilot/${copilotId}/workflow/${data.flow_id}`);
      setOpen(false);
      toast({
        title: "Flow created",
        description: `Flow ${data.name} was created successfully`,
        variant: "success"
      });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button>
          Create Flow
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create Flow</AlertDialogTitle>
          <AlertDialogDescription>
            Flows are a sequence of steps that are executed when the user asks a related question to your copilot.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required-label">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required-label">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea minRows={3} {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter className="!mt-5 flex items-center gap-2">
              <AlertDialogCancel type="button">
                Cancel
              </AlertDialogCancel>
              <Button type="submit" loading={state.loading}>
                Create
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}