import React from "react";
import { Calendar, type CalendarProps } from "./Calender";
import { Input } from "./inputs/BaseInput";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { useInput } from "react-day-picker";
import { BiCalendar } from "react-icons/bi";

function CalenderField({ ...props }: CalendarProps) {
  const { dayPickerProps, inputProps } = useInput(props);
  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Input
            prefixSuffixClassName="text-slate-800"
            prefix={<BiCalendar />}
            className="font-medium max-w-fit min-w-fit cursor-pointer"
            {...inputProps}
          />
        </PopoverTrigger>
        <PopoverContent className="px-0 mx-2 py-0 min-w-fit">
          <Calendar {...dayPickerProps} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default CalenderField;
