"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import cn from "../utils/cn";

const Tabs = TabsPrimitive.Root;

// const Tabs = React.forwardRef<
//   typeof TabsPrimitive.Root,
//   React.ComponentPropsWithoutRef<"div">
// >(({ className, ...props }, ref) => (
//   <TabsPrimitive.Root {...props} />
// ));
// Tabs.displayName = TabsPrimitive.List.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn("", className)} {...props} />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "after:block relative after:absolute disabled:cursor-not-allowed cursor-pointer disabled:shadow-none data-[state=active]:font-medium after:-bottom-2 after:transition after:origin-bottom after:inset-x-0 [&[data-state=active]_::after]:h-[2px] after:h-0 after:bg-indigo-500 after:rounded-full",
      "px-2 data-[state=inactive]:hover:text-slate-600 data-[state=inactive]:dark:hover:text-slate-300 whitespace-nowrap data-[state=inactive]:text-slate-500 data-[state=inactive]:dark:text-slate-400 data-[state=active]:text-indigo-500",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, forceMount, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    forceMount={forceMount}
    className={cn(
      "animate-in duration-100 fade-in-30 transition-all ease-in slide-in-from-right-0",
      forceMount &&
        "data-[state=inactive]:slide-out-to-left-10 data-[state=inactive]:fade-out-25 data-[state=inactive]:animate-out data-[state=inactive]:hidden",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
