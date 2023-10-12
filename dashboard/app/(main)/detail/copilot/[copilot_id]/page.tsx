import { HeaderShell } from "@/app/(main)/_parts/Header";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { BotIcon, Terminal } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

type Props = {
  params: {
    copilot_id: string;
  };
};

export default async function CopilotDetailPage({ params }: Props) {
  const copilotBase = "/copilot/" + params.copilot_id;
  return (
    <div className="w-full h-full flex flex-col">
      <HeaderShell>
        <div className="flex items-center gap-1">
          <Button asChild size="icon" variant="ghost">
            <Link href="/">
              <ChevronLeft className="w-6 h-6 text-accent-foreground" />
            </Link>
          </Button>
          <h1 className="text-lg font-bold inline text-accent-foreground">
            Copilot Detail Page
          </h1>
        </div>
      </HeaderShell>
      <div className="flex-1 p-8 pt-4 overflow-auto">
        <div>
          <div className="rounded-lg relative h-56 border bg-secondary shadow-sm flex items-center justify-center p-5 group">
            <div className="inset-0 absolute backdrop-blur-sm bg-accent-alt/50 group-focus-visible:opacity-100 group-focus-within:opacity-100 transition-opacity">
              <div className="h-full w-full gap-2 flex items-center justify-center">
                <Button size="lg" asChild>
                  <Link href={copilotBase + "/settings"}>Edit</Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="lg" variant="secondary">
                      ...
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Flows</DropdownMenuItem>
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="left-2 top-2 absolute">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="p-1.5 rounded-full bg-white shadow-lg">
                    <Terminal className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    created via <span className="text-white">CLI</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div>
              <div className="h-20 grid place-content-center aspect-square rounded-lg bg-slate-950 text-gray-100">
                <BotIcon className="h-12 w-12" />
              </div>
            </div>
          </div>
          <div className="mt-1.5 ps-1">
            <Link
              href={copilotBase}
              className="text-base font-semibold whitespace-nowrap line-clamp-1 text-ellipsis"
            >
              Copilot 1
            </Link>
            <p className="text-sm text-gray-400">Created 2 days ago</p>
          </div>
        </div>
        <div className="mt-10">
          <div className="bg-secondary rounded-t-lg py-5 px-4">
            <h2 className="text-lg font-bold inline text-accent-foreground">
              Latest Conversations
            </h2>
            <div className="flex items-center justify-between gap-5 mt-2">
              <Input
                placeholder="Search conversations..."
                className="focus-visible:ring-transparent focus-visible:ring-offset-transparent"
              />
              <Button>Chat</Button>
            </div>
          </div>
          <Table
            className="text-base"
            wrapperClassName="rounded-t-none border-t-transparent"
          >
            <TableHeader>
              <TableRow>
                <TableHead>conversation id</TableHead>
                <TableHead>messages no.</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>123465498</TableCell>
                <TableCell>30</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost">
                    <MoreHorizontal className="h-5 w-5 text-accent-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
