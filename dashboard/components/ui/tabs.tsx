"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";
type WithExtraProps<T> = T & {
  unstyled?: boolean;
}
const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  WithExtraProps<React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>
>(({ className, unstyled, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      !unstyled && "inline-flex h-10 items-center rounded-md bg-muted p-1 text-muted-foreground w-full justify-between",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  WithExtraProps<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>
>(({ className, unstyled, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "whitespace-nowrap disabled:pointer-events-none",
      !unstyled && "inline-flex px-3 py-1.5  items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  WithExtraProps<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>
>(({ className, unstyled, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      !unstyled && "mt-2 ring-offset-background animate-in data-[state=active]:fade-in data-[state=inactive]:animate-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
