"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { atom, useAtom, useSetAtom } from "jotai";
import { Textarea } from "@/components/ui/textarea";
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
type DialogTypes = "url" | "file" | null;
const activeDialog = atom<DialogTypes>(null);

function AddUrlDataSource() {
  const [dialog, setDialog] = useAtom(activeDialog);
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
        <Textarea minRows={4} placeholder="https://example.com/page" />
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost">Cancel</Button>
          </AlertDialogCancel>
          <Button variant="default">Add</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AddFileDataSource() {
  const [dialog, setDialog] = useAtom(activeDialog);
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
          maxFiles={1}
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
          <Button variant="default">Add</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AddDataSource() {
  const setDialog = useSetAtom(activeDialog);
  useHotkeys("shift+u", () => setDialog("url"));
  useHotkeys("shift+f", () => setDialog("file"));
  return (
    <>
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
    </>
  );
}
