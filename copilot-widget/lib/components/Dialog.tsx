import { createSafeContext } from "@lib/contexts/create-safe-context";
import cn from "@lib/utils/cn";
import {
  ElementRef,
  ComponentPropsWithoutRef,
  forwardRef,
  useState,
} from "react";

type DialogProps = {
  open?: boolean;
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
};

const [useDialog, DialogProvider] = createSafeContext<{
  open: boolean;
  set: (open: boolean) => void;
}>();

function Dialog({ children, ...props }: DialogProps) {
  const [open, setOpen] = useState(props.open || false);
  function set(to: boolean) {
    setOpen(to);
    props.onOpenChange?.(to);
  }
  return <DialogProvider value={{ open, set }}>{children}</DialogProvider>;
}

const DialogTrigger = forwardRef<
  ElementRef<"button">,
  ComponentPropsWithoutRef<"button">
>(({ className, onClick, ...props }, _ref) => {
  const { set, open } = useDialog();
  return (
    <button
      data-state={open ? "open" : "closed"}
      onClick={(ev) => {
        onClick?.(ev);
        set(true);
      }}
      className={cn("", className)}
      ref={_ref}
      {...props}
    />
  );
});
DialogTrigger.displayName = "DialogTrigger";

const DialogOverlay = forwardRef<
  ElementRef<"div">,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  const { open } = useDialog();
  return (
    <div
      {...props}
      data-state={open ? "open" : "closed"}
      className={cn(
        "absolute flex items-center justify-center overflow-hidden inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      ref={ref}
    />
  );
});
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = forwardRef<
  ElementRef<"div">,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  const { open } = useDialog();
  return (
    open && (
      <DialogOverlay>
        <div
          {...props}
          data-state={open ? "open" : "closed"}
          className={cn(
            "rounded-lg z-[100] w-full grid max-w-[70%] min-w-fit bg-white gap-2 shadow-lg p-4 animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom-3",
            className
          )}
          ref={ref}
        />
      </DialogOverlay>
    )
  );
});
DialogContent.displayName = "DialogContent";

const DialogClose = forwardRef<
  ElementRef<"button">,
  ComponentPropsWithoutRef<"button">
>(({ className, onClick, ...props }, ref) => {
  const { set } = useDialog();
  return (
    <button
      {...props}
      onClick={(ev) => {
        onClick?.(ev);
        set(false);
      }}
      className={cn("", className)}
      ref={ref}
    />
  );
});
DialogClose.displayName = "DialogClose";

const DialogHeader = forwardRef<
  ElementRef<"div">,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  const { open } = useDialog();
  return (
    <div
      {...props}
      data-state={open ? "open" : "closed"}
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      ref={ref}
    />
  );
});
DialogHeader.displayName = "DialogHeader";

export {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogHeader,
};
