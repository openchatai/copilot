"use client";
import { ReactNode, forwardRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ToolTip";
import React from "react";
import cn from "../../utils/cn";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import { toast } from "../headless/toast/use-toast";
import { useId } from "@/ui/hooks";
import { AiOutlineExclamationCircle, AiOutlineInfoCircle } from "react-icons/ai";
import { FcCheckmark } from "react-icons/fc";
import { BiCopy, BiErrorAlt } from "react-icons/bi";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  tooltip?: string;
  copy?: boolean;
  suffix?: ReactNode;
  prefix?: ReactNode;
  prefixSuffixClassName?: string;
  description?: string;
  state?: "error" | "success";
  errorMsg?: string;
  wrapperClassName?: string;
  labelClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      labelClassName,
      tooltip,
      description,
      suffix,
      prefix,
      copy,
      type,
      state,
      errorMsg,
      wrapperClassName,
      prefixSuffixClassName,
      ...props
    },
    ref
  ) => {
    const _id = useId();
    const [copied, copyFn] = useCopyToClipboard();
    const id = props.id ?? _id;
    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <div className="w-full flex items-center justify-between mb-1">
            <label
              htmlFor={id}
              className={cn(
                "text-slate-800 dark:text-slate-400 block text-sm font-medium mb-1 select-none",
                props.required &&
                  "after:content-['*'] after:ml-0.5 after:text-rose-500",
                labelClassName
              )}
            >
              {label}
            </label>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span>
                      <AiOutlineExclamationCircle />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs mx-2 max-w-tiny">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
        <div className="w-full relative z-[5]">
          {copy && props.value && (
            <button
              disabled={copied}
              onClick={() =>
                copyFn(props.value).then(() => {
                  toast({
                    title: "Copied",
                    description: "Copied to clipboard",
                    intent: "success",
                  });
                })
              }
              className="absolute z-10 right-2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              {copied ? <FcCheckmark /> : <BiCopy />}
            </button>
          )}
          {prefix && (
            <div
              className={cn(
                "absolute z-10 left-0 top-0 bottom-0 h-full right-auto flex items-center justify-center pointer-events-none",
                prefixSuffixClassName
              )}
            >
              <span
                className={cn(
                  "text-sm text-slate-400 font-medium px-3",
                  state === "success" && "text-emerald-500",
                  state === "error" && "text-rose-500"
                )}
              >
                {prefix}
              </span>
            </div>
          )}
          {suffix && (
            <div
              className={cn(
                "absolute z-10 top-0 bottom-0 h-full right-0 left-auto flex items-center justify-center pointer-events-none",
                prefixSuffixClassName
              )}
            >
              <span
                className={cn(
                  "text-sm text-slate-400 font-medium px-3",
                  state === "success" && "text-emerald-500",
                  state === "error" && "text-rose-500"
                )}
              >
                {suffix}
              </span>
            </div>
          )}
          <input
            spellCheck={false}
            autoCorrect="on"
            id={id}
            type={type}
            className={cn(
              "form-input placeholder-slate-400 bg-white border transition-colors focus:ring-0 focus:ring-offset-0 w-full text-sm text-slate-800 leading-5 py-2 px-3 border-slate-200 hover:border-slate-300 focus:border-slate-300 shadow-sm rounded",
              "disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed",
              state === "error" && "border-rose-500",
              state === "success" && "border-emerald-500",
              prefix && "pl-12",
              suffix || (copy && "pr-12"),
              "dark:bg-slate-900/30 dark:disabled:bg-slate-700/30 focus-visible:outline-none dark:disabled:border-slate-700 dark:disabled:hover:border-slate-700 dark:text-slate-100 dark:border-slate-700 dark:hover:border-slate-600 dark:placeholder-slate-500 dark:focus:border-slate-600",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {description && (
          <span className="w-full mt-1 text-xs text-slate-600 flex items-center dark:text-slate-200">
            <AiOutlineInfoCircle/><span className="ml-1">{description}</span>
          </span>
        )}
        {errorMsg && state && (
          <span
            className={cn(
              "w-full mt-1 text-xs flex items-center text-slate-600 dark:text-slate-200",
              state === "success" && "text-emerald-500 dark:text-emerald-400",
              state === "error" && "text-rose-500 dark:text-rose-400"
            )}
          >
            <BiErrorAlt />
            <span className="ml-1">{errorMsg}</span>
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
export { Input };
