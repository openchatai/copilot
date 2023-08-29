"use client";
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import cn from "../utils/cn";
import { BiChevronDown } from "react-icons/bi";
const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, _ref) => {
  return (
    <AccordionPrimitive.Item
      ref={_ref}
      className={cn(
        "px-5 py-4 rounded-sm dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
        className
      )}
      {...props}
    />
  );
});
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex max-w-full">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex items-center justify-between w-full text-sm text-slate-800 dark:text-slate-100 font-medium group/trigger text-start",
        className
      )}
      {...props}
    >
      {children}
      <BiChevronDown
        size={30}
        className="shrink-0 fill-current text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400 ml-3 transition-transform duration-200 rotate-0 group-data-[state=open]/trigger:rotate-180"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden max-w-full pt-5 text-sm transition-all data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp",
      className
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
