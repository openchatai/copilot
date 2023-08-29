"use client";
import React, { ReactNode } from "react";
import {
  AccordionItem as AccordionItemAlt,
  AccordionContent,
  AccordionTrigger,
} from "./AccordionAlt";

export default function AccordionItem({
  title,
  children,
  value,
}: {
  title: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <AccordionItemAlt
      value={value}
      className="w-full border-y p-2 transition-all"
    >
      <AccordionTrigger className="py-3 px-1 w-full">
        <div className="flex items-center gap-5 text-lg font-semibold text-slate-800">
          <svg
            className="w-4 h-4 fill-current text-blue-500 shrink-0"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              y="7"
              width="16"
              height="2"
              rx="1"
              className="transform origin-center transition duration-200 ease-out group-data-[state=open]/trigger:!rotate-180"
            ></rect>
            <rect
              y="7"
              width="16"
              height="2"
              rx="1"
              className="transform origin-center rotate-90 transition duration-200 ease-out group-data-[state=open]/trigger:!rotate-180"
            ></rect>
          </svg>
          <h2 className="flex-1 text-start">{title}</h2>
        </div>
      </AccordionTrigger>
      <AccordionContent asChild>
        <div className="flex items-center py-2 px-4 gap-5 w-full text-sm transition-all">
          <div className="flex-1 text-gray-600 text-base leading-6">
            {children}
          </div>
        </div>
      </AccordionContent>
    </AccordionItemAlt>
  );
}
