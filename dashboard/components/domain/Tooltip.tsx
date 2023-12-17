'use client';
import React, { ComponentPropsWithoutRef } from "react";
import { Tooltip as OriginalTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export function Tooltip({ children, content, ...contentProps }: { children: React.ReactNode, content: React.ReactNode } & Omit<ComponentPropsWithoutRef<typeof TooltipContent>, 'content'>) {
    return (
        <TooltipProvider delayDuration={0}>
            <OriginalTooltip>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent {...contentProps}>
                    {content}
                </TooltipContent>
            </OriginalTooltip>
        </TooltipProvider>
    )
}