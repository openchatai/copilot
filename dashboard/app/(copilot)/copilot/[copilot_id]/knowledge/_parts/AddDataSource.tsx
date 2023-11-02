"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogCancel,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { atom, useAtom, useSetAtom } from "jotai";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropZone } from "@/components/domain/DropZone";
type DialogTypes = "url" | "file" | null;
const activeDialog = atom<DialogTypes>(null);

function AddUrlDataSource() {
  const [dialog, setDialog] = useAtom(activeDialog);
  return (
    <Dialog
      open={dialog === "url"}
      onOpenChange={(op) => {
        if (!op) setDialog(null);
      }}
    >
      <DialogContent withClose>
        <DialogHeader>
          <DialogTitle>Add URL(s)</DialogTitle>
        </DialogHeader>
        <DialogDescription>add one or more URLs to scrape</DialogDescription>
        <Textarea minRows={4} placeholder="https://example.com/page" />
        <DialogFooter>
          <DialogCancel asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogCancel>
          <Button variant="default">Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddFileDataSource() {
  const [dialog, setDialog] = useAtom(activeDialog);
  return (
    <Dialog
      open={dialog === "file"}
      onOpenChange={(op) => {
        if (!op) setDialog(null);
      }}
    >
      <DialogContent withClose>
        <DialogHeader>
          <DialogTitle>
            Add File
            <span className="text-sm text-muted-foreground">
              {" "}
              (CSV, JSON, XML, PDF)
            </span>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          add a file to upload and scrape data from.
        </DialogDescription>
        <DropZone />
        <DialogFooter>
          <DialogCancel asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogCancel>
          <Button variant="default">Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddDataSource() {
  const setDialog = useSetAtom(activeDialog);
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button>Add Data Source</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-trigger-anchor [&>*]:text-base">
          <DropdownMenuItem onClick={() => setDialog("url")}>
            URL(s)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog("file")}>
            File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddUrlDataSource />
      <AddFileDataSource />
    </>
  );
}
