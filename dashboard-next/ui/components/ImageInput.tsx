/* eslint-disable @next/next/no-img-element */
import React, {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
  forwardRef,
  useId,
  useState,
} from "react";
import cn from "../utils/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ToolTip";
import { AiOutlineExclamationCircle } from "react-icons/ai";

export type ImageInputProps = ComponentPropsWithoutRef<"input"> & {
  initialImageUrl?: string;
  label?: string;
  wrapperClassName?: string;
  tooltip?: ReactNode;
};

export const ImageInput = forwardRef<ElementRef<"input">, ImageInputProps>(
  ({ initialImageUrl, label, wrapperClassName, tooltip, ...props }, ref) => {
    const [imagePreview, setImagePreview] = useState<string>(
      initialImageUrl || ""
    );
    const _id = useId();
    const id = props.id || _id;

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      props.onChange?.(event);
    }
    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <div className="flex items-center w-full justify-between">
            <span className="text-slate-800 dark:text-slate-400 text-sm font-medium mb-1 select-none">
              {label}
            </span>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AiOutlineExclamationCircle />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs mx-2 max-w-tiny z-[500] relative">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
        <input
          type="file"
          id={id}
          className="hidden"
          onChange={handleImageChange}
          accept="image/*"
        />
        <label
          htmlFor={id}
          className="w-12 h-12 rounded-md ms-auto overflow-hidden block border border-slate-300 dark:border-slate-500 cursor-pointer"
        >
          <img
            src={imagePreview}
            alt="image preview"
            className="w-full h-full max-w-full max-h-full object-cover after:opacity-0 before:opacity-0"
          />
        </label>
      </div>
    );
  }
);

ImageInput.displayName = "ImageUploadInput";
