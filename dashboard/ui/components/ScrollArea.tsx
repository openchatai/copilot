"use client";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { forwardRef, useRef } from "react";
import cn from "../utils/cn";
import useScroll from "../hooks/useScroll";
import { useMergedRef } from "../hooks/useMergeRefs";

const ScrollArea = forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  const _scrollRef = useRef(null);
  const mergedRef = useMergedRef(ref, _scrollRef);
  const { x, y, scrollHeight, scrollWidth } = useScroll(_scrollRef);
  return (
    <ScrollAreaPrimitive.Root
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={mergedRef}
        data-scroll-block-start={y.toString()}
        data-scroll-inline-start={x.toString()}
        data-scroll-height={scrollHeight?.toString()}
        data-scroll-width={scrollWidth?.toString()}
        className="h-full w-full rounded-[inherit] group/viewport"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-all animate-in",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-slate-600 hover:bg-slate-800 transition-all" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
