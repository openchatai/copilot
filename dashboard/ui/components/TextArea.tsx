"use client";
import { forwardRef, useId } from "react";
import cn from "../utils/cn";
import TextareaAutosize from "react-textarea-autosize";
import { AiOutlineExclamationCircle } from "react-icons/ai";

export interface TextareaProps
  extends React.ComponentPropsWithoutRef<typeof TextareaAutosize> {
  label?: string;
  labelClassName?: string;
  description?: string[];
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, labelClassName, description, ...props }, ref) => {
    const id = useId();
    return (
      <div className="w-full">
        {label && (
          <div className="mb-1.5">
            <label htmlFor={id} className={cn("text-sm", labelClassName)}>
              {label}
            </label>
          </div>
        )}
        <TextareaAutosize
          className={cn(
            "outline-none resize-none scrollbar-thin font-medium flex w-full bg-transparent shadow-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder-slate-400 bg-white focus:ring-0 focus:ring-offset-0 text-sm text-slate-800 leading-5 py-2 px-3 border border-slate-200 focus:border-slate-300 rounded",
            "dark:bg-slate-900/30 dark:disabled:bg-slate-700/30 dark:disabled:border-slate-700 dark:disabled:hover:border-slate-700 dark:text-slate-100 dark:border-slate-700 dark:hover:border-slate-600 dark:placeholder-slate-500 dark:focus:border-slate-60",
            className
          )}
          ref={ref}
          {...props}
          id={id}
        />
        {description &&
          description.map((desc, i) => (
            <span
              key={i}
              className={cn(
                "block mt-0.5 text-xs font-light text-slate-600 dark:text-slate-200"
              )}
            >
              <AiOutlineExclamationCircle className="inline" /> <span className="me-1 inline">{desc}</span>
            </span>
          ))}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
