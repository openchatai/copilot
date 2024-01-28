"use client";

import * as React from "react";
import { PopoverProps } from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDown, Plus } from "lucide-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useMutationObserver } from "@/hooks/mutation-observer";
import {
    Dialog,
    DialogCancel,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { type Context } from "./data";


interface ContextSelectorProps extends PopoverProps {
    contexts: Context[];
    defaultContext?: Context;
}

export function ContextPresetSelector({
    contexts,
    defaultContext,
    ...props
}: ContextSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [selectedContext, setSelectedContext] = React.useState<
        Context | undefined
    >(defaultContext || contexts[0]);
    const [peekedContext, setPeekedContext] = React.useState<Context>();
    return (
        <div className="grid gap-2">
            <Label htmlFor="context">Select Context</Label>
            <Popover open={open} onOpenChange={setOpen} {...props}>
                <div className="flex items-center gap-4">
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            aria-label="Select a context"
                            className="w-full justify-between"
                        >
                            {selectedContext ? selectedContext.name : "Select a context..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Custom Context</DialogTitle>
                            </DialogHeader>
                            <Label>Title</Label>
                            <Input />
                            <Label>Context</Label>
                            <Textarea />
                            <DialogFooter>
                                <Button size="sm">Save</Button>
                                <DialogCancel asChild>
                                    <Button variant="secondary" size="sm">
                                        Cancel
                                    </Button>
                                </DialogCancel>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <PopoverContent align="end" className="w-[250px] p-0">
                    <HoverCard>
                        {peekedContext && (
                            <HoverCardContent
                                side="left"
                                align="end"
                                forceMount
                                className="min-h-[200px]"
                            >
                                <div className="grid gap-2">
                                    <h4 className="font-semibold leading-none text-accent-foreground">
                                        {peekedContext?.name}
                                    </h4>
                                    <div className="text-sm text-muted-foreground">
                                        {peekedContext?.content}
                                    </div>
                                </div>
                            </HoverCardContent>
                        )}

                        <Command loop>
                            <CommandInput placeholder="Search Contexts..." />
                            <CommandList className="h-[200px] overflow-auto">
                                <CommandEmpty>No Such Context</CommandEmpty>
                                {contexts.map((context) => {
                                    return (
                                        <>
                                            <ModelItem
                                                key={context.id}
                                                context={context}
                                                isSelected={selectedContext?.id === context.id}
                                                onPeek={(model) => setPeekedContext(model)}
                                                onSelect={() => {
                                                    setSelectedContext(context);
                                                    setOpen(false);
                                                }}
                                            />
                                            {peekedContext?.id === context.id && (
                                                <HoverCardTrigger key={context.name} />
                                            )}
                                        </>
                                    );
                                })}
                            </CommandList>
                        </Command>
                    </HoverCard>
                </PopoverContent>
            </Popover>
        </div>
    );
}

interface ModelItemProps {
    context: Context;
    isSelected: boolean;
    onSelect: () => void;
    // eslint-disable-next-line no-unused-vars
    onPeek: (context: Context) => void;
}

function ModelItem({ context, isSelected, onSelect, onPeek }: ModelItemProps) {
    const ref = React.useRef<HTMLDivElement>(null);
    const $onPeek = React.useCallback(onPeek, [onPeek]);
    useMutationObserver(ref, (mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === "attributes") {
                if (mutation.attributeName === "data-selected") {
                    $onPeek(context);
                }
            }
        }
    });

    return (
        <CommandItem
            key={context.id}
            onSelect={onSelect}
            ref={ref}
            className="mx-2 my-2 aria-selected:bg-primary aria-selected:text-primary-foreground"
        >
            {context.name}
            <CheckIcon
                className={cn(
                    "ml-auto h-4 w-4",
                    isSelected ? "opacity-100" : "opacity-0",
                )}
            />
        </CommandItem>
    );
}
