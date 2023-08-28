"use client";
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import cn from "../utils/cn";
import { createSafeContext } from "../utils/createSafeContext";
import { AnimatePresence, motion } from "framer-motion";

type PopoverProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Root
>;
const [PopoverSafeProvider, usePopover] = createSafeContext<{ open: boolean }>(
  "Popover"
);
const PopoverAnchor = PopoverPrimitive.Anchor;
function Popover({ onOpenChange, ...props }: PopoverProps) {
  const [open, setOpen] = React.useState(
    props.open || props.defaultOpen || false
  );
  return (
    <PopoverSafeProvider value={{ open }}>
      <PopoverPrimitive.Root
        {...props}
        onOpenChange={(op) => {
          setOpen(op);
          onOpenChange?.(op);
        }}
      />
    </PopoverSafeProvider>
  );
}

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(
  (
    { className, align = "center", sideOffset = 4, children, ...props },
    ref
  ) => {
    const { open } = usePopover();
    return (
      <AnimatePresence>
        {open && (
          <PopoverPrimitive.Portal forceMount>
            <PopoverPrimitive.Content
              ref={ref}
              align={align}
              sideOffset={sideOffset}
              asChild
              forceMount
              className={cn(
                "border-slate-200 z-50 min-w-[20rem] dark:border-slate-700 dark:bg-slate-800 border shadow-lg outline-none bg-white rounded py-3 px-2 origin-[var(--radix-popover-content-transform-origin)]",
                "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
                "data-[side=left]:[--x-in:10px] data-[side=right]:[--x-in:-10px] data-[side=top]:[--y-in:10px] data-[side=bottom]:[--y-in:-10px]",
                "group/popover",
                className
              )}
              {...props}
            >
              <motion.div
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <PopoverPrimitive.Arrow
                  className="fill-current text-slate-200 dark:text-slate-700 text-xl -mb-px"
                  width={20}
                  height={10}
                />
                {children}
              </motion.div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        )}
      </AnimatePresence>
    );
  }
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
