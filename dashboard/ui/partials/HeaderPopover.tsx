import { Avatar, AvatarFallback } from "../components/Avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/Popover";

export default function ProfilePopover() {
  return (
    <Popover>
      <PopoverTrigger className="inline-flex justify-center items-center group">
        <Avatar size={2}>
          <AvatarFallback className="uppercase">LU</AvatarFallback>
        </Avatar>
        <div className="flex items-center truncate">
          <span className="truncate ml-2 text-sm font-medium dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-200">
            Local
          </span>
        </div>
      </PopoverTrigger>

      <PopoverContent align="end" className="origin-top-right min-w-[11rem]">
        <div>
          <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-slate-200 dark:border-slate-700">
            <div className="font-medium text-slate-800 dark:text-slate-100">
              Local
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 italic">
              Administrator
            </div>
          </div>
          <div className="flex w-full items-start flex-col gap-1">
            {/* <HeaderUpgradePlan /> */}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
