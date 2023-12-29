"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight } from "lucide-react";
import { Link } from "@/lib/router-events";
import { useSearchModal } from "@/app/search-modal-atom";

// i'm bad at naming things
export default function LogoMenu() {
  const [, setSearchModal] = useSearchModal();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group relative aspect-square h-full w-full rounded-lg text-xl text-primary/90 outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
          ◄
          <ChevronRight className="absolute bottom-0 right-0 h-5 w-5 rotate-45 fill-current transition-transform group-data-[state=open]:translate-x-0.5 group-data-[state=open]:translate-y-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" className="-mt-2 ms-12">
        <DropdownMenuItem asChild>
          <Link href="/">Back to dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setSearchModal(true)}>
          Search
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={"/create/copilot"}>Create New Copilot</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
