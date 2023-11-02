"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Trash2 } from "lucide-react";
export function KnowledgeTable() {
  return (
    <HoverCard open>
      <Table wrapperClassName="rounded-none">
        <TableHeader>
          <TableRow>
            <TableHead role="checkbox" className="w-2 px-8">
              <Checkbox CheckedIcon={Minus} />
            </TableHead>
            <TableHead className="px-8 text-accent-foreground">Name</TableHead>
            <TableHead className="px-8">Type</TableHead>
            <TableHead className="px-8">Status</TableHead>
            <TableHead className="px-8">Date</TableHead>
          </TableRow>
        </TableHeader>
        <HoverCardTrigger asChild>
          <TableBody className="odd:bg-white">
            <TableRow>
              <TableCell role="checkbox" className="w-2 pl-8">
                <Checkbox />
              </TableCell>
              <TableCell className="px-8">Cell 1</TableCell>
              <TableCell className="px-8">Cell 2</TableCell>
              <TableCell className="px-8">Cell 3</TableCell>
              <TableCell className="px-8">Cell 3</TableCell>
            </TableRow>
          </TableBody>
        </HoverCardTrigger>
      </Table>
      <HoverCardContent
        side="bottom"
        className="h-14 w-[400px] rounded-xl border-none bg-[#33373A] p-2 text-white"
      >
        <div className="ml-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="flex-center h-4 w-4 rounded bg-[#5D6264] text-white">
              <Minus className="h-3 w-3" />
            </button>
            <div className="text-sm text-muted-foreground">
              <span>
                <span className="text-white">3</span> documents selected
              </span>
            </div>
          </div>
          <button className="flex-center rounded-lg bg-[#5D6264] p-3 text-white">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
