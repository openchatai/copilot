"use client";
import SketchColorPicker, { SketchProps } from "@uiw/react-color-sketch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/Popover";
import { useId, useState } from "react";
import cn from "../utils/cn";
import { useField } from "@formiz/core";

type ColorPickerInputProps = Omit<SketchProps,"color"> & {
  label?: string;
  triggerClassName?: string;
  color?: string;
};

export function ColorPickerInput({
  color,
  onChange,
  disableAlpha = true,
  className,
  label,
  triggerClassName,
  ...props
}: ColorPickerInputProps) {
  const [activeColor, setActiveColor] = useState(color);
  const _id = useId();
  const id = props.id || _id;
  return (
    <div className="flex items-center w-full justify-between">
      {label && (
        <label
          className="text-slate-900 dark:text-slate-300 text-xs font-medium mb-1 whitespace-nowrap"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <Popover>
        <PopoverTrigger id={id} asChild>
          <button
            type="button"
            className={cn(
              "h-6 aspect-square w-auto rounded border border-slate-200 dark:border-slate-700 p-px",
              triggerClassName
            )}
            style={{ backgroundColor: activeColor?.toString() }}
          />
        </PopoverTrigger>
        <PopoverContent className="min-w-fit p-0 border-0" asChild>
          <SketchColorPicker
            color={activeColor}
            onChange={(selected) => {
              setActiveColor(selected.hex);
              onChange?.(selected);
            }}
            className={cn(
              "[&_.w-color-saturation]:!rounded-md [&_.w-color-editable-input]:!hidden [&_input:focus]:!outline-none dark:[--sketch-swatch-border-top:theme(colors.slate.200)_!important] dark:!bg-slate-800 dark:!text-slate-200 !text-slate-70 dark:!border-slate-700 !border !shadow-lg !outline-none !bg-white rounded",
              className
            )}
            {...props}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
export function ColorPickerField(
  props: ColorPickerInputProps & { name: string }
) {
  const { setValue, ...fieldProps } = useField(props);
  return (
    <>
      <input type="hidden" {...fieldProps} name={props.name} />
      <ColorPickerInput
        {...props}
        color={fieldProps.value}
        onChange={(color) => setValue(color.hex.toString())}
      />
    </>
  );
}
