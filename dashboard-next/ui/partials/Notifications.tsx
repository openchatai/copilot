import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../components/Popover";
import { Link } from "../router-events";
import { IoIosNotifications } from "react-icons/io";

export function Notifications() {
  return (
    <div>
      <Popover>
        <PopoverTrigger
          className={
            "w-8 h-8 flex relative data-[state=open]:bg-slate-200 items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600/80 rounded-full"
          }
        >
          <span className="sr-only">Notifications</span>
          <IoIosNotifications />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className=" py-1.5 rounded shadow-lg overflow-hidden mt-1 min-w-80 max-w-xs w-fit"
        >
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase pt-1.5 pb-2 px-4">
            Notifications
          </div>

          <ul className="divide-x divide-slate-200 dark:divide-slate-700 focus:outline-none">
            <li>
              <Link
                className="block py-2 px-4 bg-slate-50 dark:bg-slate-700/20"
                href="#0"
              >
                <span className="block text-sm mb-2 text-slate-600">
                  📣
                  <span className="font-medium text-slate-800 pr-1 dark:text-slate-100">
                    Edit your information in a swipe
                  </span>
                  Sint occaecat cupidatat non proident, sunt in culpa qui
                  officia deserunt mollit anim.
                </span>
                <span className="block text-xs font-medium text-slate-400 dark:text-slate-500">
                  Feb 12, 2021
                </span>
              </Link>
            </li>
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default Notifications;
