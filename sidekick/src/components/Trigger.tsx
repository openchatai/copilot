import { ComponentPropsWithoutRef, forwardRef } from "react";
import { HiOutlineChevronDown } from "react-icons/hi";
import { RiChatSmileFill } from "react-icons/ri";
import cn from "../utils/cn";

const Trigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button"> & { open: boolean }
>(({ open, className, ...props }, ref) => {
  return (
    <button
      className={cn(
        "opencopilot-z-[10000000] opencopilot-rounded-full opencopilot-bg-primary opencopilot-p-3 opencopilot-text-2xl opencopilot-text-white opencopilot-transition-transform hover:opencopilot-scale-110",
        className
      )}
      ref={ref}
      {...props}
    >
      {!open && (
        <div className="icon-closed scale-in-center">
          <RiChatSmileFill />
        </div>
      )} 
      {open && (
        <div className="icon-opened rotate-in">
          <HiOutlineChevronDown />
        </div>
      )}
    </button>
  );
});

Trigger.displayName = "Trigger";

export default Trigger;
