import React from "react";
import { VariantProps, tv } from "tailwind-variants";
import cn from "../utils/cn";

const banner2Variants = tv({
  base: "px-4 py-2 rounded-sm text-sm border data-[level='2']:dark:!border-transparent",
  variants: {
    intent: {
      default:
        "bg-indigo-100 border-indigo-200 data-[level='2']:dark:!bg-indigo-400/30 data-[level='2']:dark:!text-indigo-400 data-[level='1']:bg-amber-500 first-letter:text-indigo-500",
      success:
        "bg-emerald-100 border-emerald-200 data-[level='1']:bg-emerald-500 data-[level='2']:dark:!bg-emerald-400/30 data-[level='2']:dark:!text-emerald-500 text-emerald-600",
      error:
        "bg-rose-100 border-rose-200 data-[level='1']:bg-rose-500 text-rose-600 data-[level='2']:dark:!bg-rose-400/30 data-[level='2']:dark:!text-rose-400 ",
      warning:
        "bg-amber-100 border-amber-200 data-[level='1']:bg-amber-500 data-[level='2']:dark:!bg-amber-400/30 data-[level='2']:dark:!text-amber-400 text-amber-600",
    },
  },
  defaultVariants: {
    intent: "default",
  },
});

type bannerType = VariantProps<typeof banner2Variants>["intent"];

const typeIcon = (type: bannerType) => {
  switch (type) {
    case "warning":
      return (
        <svg
          className="w-4 h-4 shrink-0 fill-current opacity-80 mt-[3px] mr-3"
          viewBox="0 0 16 16"
        >
          <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z" />
        </svg>
      );
    case "error":
      return (
        <svg
          className="w-4 h-4 shrink-0 fill-current opacity-80 mt-[3px] mr-3"
          viewBox="0 0 16 16"
        >
          <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 10.1l-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4L9.4 8l2.1 2.1z" />
        </svg>
      );
    case "success":
      return (
        <svg
          className="w-4 h-4 shrink-0 fill-current opacity-80 mt-[3px] mr-3"
          viewBox="0 0 16 16"
        >
          <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zM7 11.4L3.6 8 5 6.6l2 2 4-4L12.4 6 7 11.4z" />
        </svg>
      );
    default:
      return (
        <svg
          className="w-4 h-4 shrink-0 fill-current opacity-80 mt-[3px] mr-3"
          viewBox="0 0 16 16"
        >
          <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12H7V7h2v5zM8 6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
        </svg>
      );
  }
};

interface Banner2Props {
  variant?: VariantProps<typeof banner2Variants>;
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2;
}

export default function Banner2({
  children,
  className,
  variant,
  level = 1,
}: Banner2Props) {
  return (
    <div className={cn(className, !open && "hidden")} role="alert">
      <div
        data-level={level}
        className={cn(banner2Variants(variant), 'data-[level="1"]:text-white')}
      >
        <div className="flex w-full justify-between items-start">
          <div className="flex">
            {typeIcon(variant?.intent)}
            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
