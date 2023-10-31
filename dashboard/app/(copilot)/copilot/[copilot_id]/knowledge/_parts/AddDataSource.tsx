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
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

function AddUrlDataSource() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem>URL(s)</DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Add URL(s)</DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export function AddDataSource() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button>Add Data Source</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <AddUrlDataSource />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
