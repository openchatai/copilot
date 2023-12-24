'use client';
import React, { ComponentPropsWithoutRef } from "react";
import { Tooltip as OriginalTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export function Tooltip({ children, content, delay = 0, ...contentProps }: { children: React.ReactNode, content: React.ReactNode, delay?: number } & Omit<ComponentPropsWithoutRef<typeof TooltipContent>, 'content'>) {
    return (
        <TooltipProvider delayDuration={delay}>
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