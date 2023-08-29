"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import cn from "@/ui/utils/cn";
import { createSafeContext } from "@/ui/utils/createSafeContext";
import { type ComponentPropsWithoutRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
type DialogProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
const [SafeDialogProvider, useDialog] =
  createSafeContext<Pick<DialogProps, "open">>("Dialog");

function Dialog(props: DialogProps) {
  const [DialogOpen, setDialogOpen] = React.useState<boolean>(
    props.open || props.defaultOpen || false
  );
  return (
    <SafeDialogProvider
      value={{
        open: DialogOpen,
      }}
    >
      <DialogPrimitive.Root
        {...props}
        open={DialogOpen}
        onOpenChange={(open) => setDialogOpen(open)}
      />
    </SafeDialogProvider>
  );
}

Dialog.displayName = DialogPrimitive.Root.displayName;

const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 bg-slate-900/30 z-50 transition-opacity backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { open } = useDialog();
  return (
    <DialogPortal>
      <DialogOverlay className="flex-center p-4">
        <AnimatePresence>
          {open && (
            <DialogPrimitive.Content
              ref={ref}
              forceMount
              className={cn(
                "bg-white z-50 select-auto grid max-w-lg dark:bg-slate-800 border border-transparent dark:border-slate-700 overflow-auto w-full max-h-full rounded shadow-lg scrollbar-thin",
                className
              )}
              asChild
              {...props}
            >
              <motion.div
                exit={{
                  y: "50%",
                  scale: 0.95,
                }}
                
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                initial={{
                  y: 50,
                  opacity: 0,
                  scale: 0.5,
                }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                }}

                drag
                dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                dragSnapToOrigin
                dragElastic={0.1}
                whileDrag={{ opacity: 0.95, cursor: "grabbing" }}
              >
                {children}
              </motion.div>
            </DialogPrimitive.Content>
          )}
        </AnimatePresence>
      </DialogOverlay>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  children,
  withClose,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { withClose?: boolean }) => (
  <div
    {...props}
    className={cn(
      "px-5 py-3 border-b border-slate-200 dark:border-slate-700",
      className
    )}
  >
    <div className="flex justify-between items-center">
      <div className="font-semibold text-slate-800 dark:text-slate-100">
        {children}
      </div>
      <div hidden={!withClose}>
        <DialogClose className="text-slate-400 hover:text-slate-500">
          <div className="sr-only">Close</div>
          <svg className="w-4 h-4 fill-current">
            <path d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z" />
          </svg>
        </DialogClose>
      </div>
    </div>
  </div>
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "px-5 py-3 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
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
      "text-lg font-semibold leading-none tracking-tight text-slate-800 dark:text-slate-100",
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
      "text-sm px-5 py-3 max-h-[350px] overflow-y-auto scrollbar-thin",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
