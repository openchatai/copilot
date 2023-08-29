"use client";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { forwardRef } from "react";
import cn from "../utils/cn";
import { useId } from "../hooks";
type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>;
const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer [&_+_input]:[display:none_!important] inline-flex [--width:24px] h-[var(--width)] min-w-[44px] px-px shrink-0 cursor-pointer items-center group transition-all rounded-full border border-transparent disabled:cursor-not-allowed",
      "data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-slate-400 data-[state=unchecked]:dark:bg-slate-700 disabled:border-slate-200 disabled:bg-slate-100",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block w-5 aspect-square rounded-full bg-white group-active:opacity-90 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 shadow-lg ring-0 transition-all transform"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

function SwitchInput({
  label,
  inline,
  ...props
}: SwitchProps & { label?: string; inline?: boolean }) {
  const id = useId();
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-slate-800 dark:text-slate-400 block text-sm font-medium mb-1 select-none"
          )}
        >
          {label}
        </label>
      )}

      <div className="flex items-center justify-end">
        <Switch id={id} {...props} />
      </div>
    </div>
  );
}
export { Switch, SwitchInput };
