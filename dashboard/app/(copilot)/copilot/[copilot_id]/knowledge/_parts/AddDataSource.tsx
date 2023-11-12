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
import { Plus, RefreshCcw, Trash } from "lucide-react";
import { ingestDataSources, uploadFile } from "@/data/knowledge";
import { useCopilot } from "../../../_context/CopilotProvider";
import _ from "lodash";
import { toast } from "@/components/ui/use-toast";
import { mutate } from "swr";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
type DialogTypes = "url" | "file" | null;
const activeDialog = atom<DialogTypes>(null);
const loading = atom(false);
function AddUrlDataSource() {
  const [dialog, setDialog] = useAtom(activeDialog);
  const [urls, setUrls] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useAtom(loading);
  const { id: copilotId } = useCopilot();
  async function handleAddingUrls() {
    setIsLoading(true);
    const newUrls = urls.filter((u) => u.trim() !== "");
    if (_.isEmpty(newUrls)) return;
    try {
      const resp = await ingestDataSources(newUrls, copilotId);
      if (resp.status === 200) {
        toast({
          title: "Data source(s) added successfully",
          variant: "success"
        });
        setDialog(null);
        setUrls([""]);
      }
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false);
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
        <div className="grid gap-2">
          {urls.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                className="flex-1"
                value={url}
                onChange={(e) => {
                  const newUrls = [...urls];
                  newUrls[i] = e.target.value.trim();
                  setUrls(newUrls);
                }}
                placeholder="https://example.com"
              />
              <div className="flex items-center gap-2">
                <Button
                  disabled={urls.length === 1}
                  onClick={() => setUrls(urls.filter((u, j) => i !== j))}
                  variant="destructive"
                  size="icon"
                >
                  <Trash className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    setUrls([...urls, ""]);
                  }}
                  size="icon"
                  variant="ghost"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost">Cancel</Button>
          </AlertDialogCancel>
          <Button variant="default"
            onClick={handleAddingUrls}
          >Add</Button>
        </AlertDialogFooter>
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
        toast({
          title: "Data source(s) added successfully",
          variant: "success"
        });
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
              onClick={() => mutate(copilotId + '/data_sources')}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
