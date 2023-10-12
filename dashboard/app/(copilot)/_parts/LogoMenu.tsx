"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSetAtom } from "jotai";
import { searchModalAtom } from "@/app/_store/atoms/searchModal";
export default function LogoMenu() {
  const setSearchModal = useSetAtom(searchModalAtom);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="group relative h-full w-full text-xl text-primary/90"
        >
          O
          <ChevronRight className="absolute bottom-0 right-0 h-4 w-4 rotate-45 fill-current transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" sideOffset={2} className="ms-5">
        <DropdownMenuItem asChild>
          <Link href="/">Back to dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setSearchModal(true)}>
          Search
        </DropdownMenuItem>
        <DropdownMenuItem>Chat with the Copilot</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
