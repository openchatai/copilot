"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { atom, useAtom, useSetAtom } from "jotai";
import { DropZone } from "@/components/domain/DropZone";
import { useHotkeys } from "react-hotkeys-hook";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw, Trash } from "lucide-react";
import { ingestDataSources, uploadFile } from "@/data/knowledge";
import { useCopilot } from "../../../CopilotProvider";
import _ from "lodash";
import useSWR from "swr";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFieldArray, useForm, SubmitHandler } from "react-hook-form";
import { Form } from "@/components/ui/form";
import * as zod from 'zod';
import {
  zodResolver
} from '@hookform/resolvers/zod'
import { cn } from "@/lib/utils";
import { toast } from "sonner";
type DialogTypes = "url" | "file" | null;
const activeDialog = atom<DialogTypes>(null);

const addUrlFormSchema = zod.object({
  urls: zod.array(zod.object({
    value: zod.string().url("Invalid URL, please provide a valid one")
  }))
})
type addUrlFormType = zod.infer<typeof addUrlFormSchema>
function AddUrlDataSource() {
  const form = useForm({
    mode: "onBlur",
    defaultValues: {
      urls: [{
        value: ""
      }],
    },
    resolver: zodResolver(addUrlFormSchema),
  })
  const {
    fields, remove: removeField,
    append: appendField,
  } = useFieldArray({
    name: "urls",
    control: form.control,
    rules: {
      minLength: 1,
      required: "Url is required"
    }
  })

  const [dialog, setDialog] = useAtom(activeDialog);
  const [
    loading,
    setLoading
  ] = useState(false);
  const { id: copilotId } = useCopilot();

  const onSubmit: SubmitHandler<addUrlFormType> = async (data) => {
    setLoading(true);
    const urls = data.urls.map((u) => u.value);
    try {
      const resp = await ingestDataSources(urls, copilotId);
      if (resp.status === 200) {
        toast.success("Data source(s) added successfully");
        _.delay(() => setDialog(null), 1000)
      } else {
        toast.error(
          "Error adding data source(s)",
        );
      }

    } catch (error) {
      setLoading(false);
    }
    setLoading(false);
  }
  return (
    <AlertDialog
      open={dialog === "url"}
      onOpenChange={(op) => {
        if (!op) setDialog(null);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add URL(s)</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          add one or more URLs to scrape
        </AlertDialogDescription>
        <Form
          {...form}
        >
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3"
          >
            {
              fields.map((field, index) => {
                const errorMessage = form.formState.errors.urls?.[index]?.value?.message;
                const isValid = form.formState.errors.urls?.[index]?.value === undefined;
                return <div className="flex flex-col gap-1" key={field.id}>
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      {...form.register(`urls.${index}.value`)}
                      className="flex-1"
                      data-valid={isValid}
                      placeholder="https://example.com"
                    />
                    <div className="space-x-2">
                      <Button variant="destructive" size="icon"
                        disabled={fields.length === 1}
                        onClick={() => removeField(index)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => appendField({
                        value: ""
                      })}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>{errorMessage && <p className="text-xs font-medium text-destructive">{errorMessage}</p>}
                </div>
              })
            }
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="ghost">Cancel</Button>
              </AlertDialogCancel>
              <Button variant="default" onClick={form.handleSubmit(onSubmit)} type="submit"
                disabled={!form.formState.isValid}
                loading={loading}
              >Add</Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AddFileDataSource() {
  const [dialog, setDialog] = useAtom(activeDialog);
  const [files, setFile] = useState<File[]>();
  const {
    id: copilotId,
  } = useCopilot();
  async function handleAddingFile() {
    if (!files || _.isEmpty(files)) return;
    const re = await Promise.allSettled(files.map((f) => uploadFile(f)));
    const success = re.map((r) => {
      if (r.status === 'fulfilled') {
        return r.value
      }
    }).filter((r) => r !== undefined);
    if (success.length > 0) {
      // @ts-ignore
      const resp = await ingestDataSources(success.map((f) => f?.filename), copilotId);
      if (resp.status === 200) {
        toast.success("Data source(s) added successfully");
        setDialog(null);
      }
    }
  }
  return (
    <AlertDialog
      open={dialog === "file"}
      onOpenChange={(op) => {
        if (!op) setDialog(null);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Add File
            <span className="text-sm text-muted-foreground">
              {" "}
              (CSV, JSON, XML, PDF, HTML)
            </span>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          add a file to upload and scrape data from.
        </AlertDialogDescription>
        <DropZone
          maxFiles={5}
          value={files}
          onChange={(files) => setFile(files)}
          accept={{
            json: ["application/json"],
            html: ["text/html"],
            csv: ["text/csv"],
            xml: ["text/xml"],
            pdf: ["application/pdf"],
            md: ["text/markdown"],
          }}
        />
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost">Cancel</Button>
          </AlertDialogCancel>
          <Button variant="default"
            onClick={handleAddingFile}
          >Add</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AddDataSource() {
  const { id: copilotId } = useCopilot();
  const setDialog = useSetAtom(activeDialog);
  useHotkeys("shift+u", () => setDialog("url"));
  useHotkeys("shift+f", () => setDialog("file"));
  const { isLoading, isValidating, mutate: mutateDataSources } = useSWR(copilotId + '/data_sources');
  const loading = isLoading || isValidating;
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button>Add Data Source</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-trigger-anchor [&>*]:text-base">
          <DropdownMenuItem
            onClick={() => setDialog("url")}
            className="flex items-center justify-between"
          >
            URL(s)
            <span className="text-xs font-medium text-secondary-foreground">
              shift + u
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDialog("file")}
            className="flex items-center justify-between"
          >
            File
            <span className="text-xs font-medium text-secondary-foreground">
              shift + f
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddUrlDataSource />
      <AddFileDataSource />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={mutateDataSources}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
