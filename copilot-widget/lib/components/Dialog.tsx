"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import cn from "@lib/utils/cn";
const Dialog = DialogPrimitive.Root;
const DialogClose = DialogPrimitive.Close;
const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = DialogPrimitive.Overlay;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogOverlay className="opencopilot-absolute opencopilot-inset-0 opencopilot-z-50 opencopilot-bg-black/50 opencopilot-backdrop-blur-sm data-[state=open]:opencopilot-animate-in data-[state=closed]:opencopilot-animate-out data-[state=closed]:opencopilot-fade-out-0 data-[state=open]:opencopilot-fade-in-0">
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "opencopilot-rounded-t-lg opencopilot-z-[100] opencopilot-absolute opencopilot-bottom-0 opencopilot-duration-300 opencopilot-w-full opencopilot-grid opencopilot-max-w-lg opencopilot-bg-white opencopilot-gap-4 opencopilot-shadow-lg opencopilot-p-6 opencopilot-animate-in data-[state=closed]:opencopilot-animate-out data-[state=closed]:opencopilot-fade-out-0 data-[state=open]:opencopilot-fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:opencopilot-slide-in-from-bottom",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogOverlay>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "opencopilot-flex opencopilot-flex-col opencopilot-space-y-1.5 opencopilot-text-center sm:opencopilot-text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "opencopilot-flex opencopilot-flex-col-reverse sm:opencopilot-flex-row sm:opencopilot-justify-end sm:opencopilot-space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "opencopilot-text-lg opencopilot-font-semibold opencopilot-leading-none opencopilot-tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "opencopilot-text-sm opencopilot-text-muted-foreground",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
