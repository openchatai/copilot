"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import cn from "../utils/cn";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
export type CalendarProps = React.ComponentProps<typeof DayPicker>;
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        head: "text-slate-400 text-xs",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-slate-800",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex-center"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn("h-9 w-9 p-0 font-medium text-slate-600"),
        day_selected:
          "bg-indigo-400 text-indigo-50 hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-indigo-100 text-indigo-600",
        day_outside: "opacity-50",
        day_disabled:
          "text-muted-foreground opacity-50 hover:text-indigo-50 hover:bg-indigo-300",
        day_range_middle:
          "aria-selected:bg-indigo-300 aria-selected:text-indigo-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <BiChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <BiChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
