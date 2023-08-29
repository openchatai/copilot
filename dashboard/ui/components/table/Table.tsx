import cn from "@/ui/utils/cn";
import { motion } from "framer-motion";
import React, { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

const Table = forwardRef<HTMLTableElement, ComponentPropsWithoutRef<"table">>(
  ({ className, ...props }, ref) => {
    return (
      <div className="overflow-x-auto w-full">
        <table
          ref={ref}
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </div>
    );
  }
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  ComponentPropsWithoutRef<"thead">
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "text-xs font-semibold uppercase text-slate-500 border-t border-b border-slate-200 dark:border-slate-700",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  ComponentPropsWithoutRef<"tbody">
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0 text-sm divide-y divide-slate-200 dark:divide-slate-700 border-b border-slate-200 dark:border-slate-700",
      className
    )}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  ComponentPropsWithoutRef<"tfoot">
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "bg-primary font-medium text-indigo-500 ",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  ElementRef<"tr">,
  ComponentPropsWithoutRef<"tr">
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      // "hover:bg-slate-400/50 data-[state=selected]:bg-slate-100",
      "transition-colors animate-in fade-in-0",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  ElementRef<"th">,
  ComponentPropsWithoutRef<"th">
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "text-left align-middle font-medium uppercase text-muted-foreground [&:has([role=checkbox])]:pr-0 px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  ElementRef<"td">,
  ComponentPropsWithoutRef<"td">
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-2 [&:has([role=checkbox])]:pr-0 first:pl-5 last:pr-5 py-3 whitespace-nowrap",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  ComponentPropsWithoutRef<"caption">
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
