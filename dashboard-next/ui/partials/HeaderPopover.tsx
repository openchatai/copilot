"use client";
import { Avatar, AvatarFallback } from "../components/Avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/Popover";
import HeaderUpgradePlan from "./HeaderUpgradePlan";
import Alert from "../components/Alert";
import { Button } from "../components/Button";
import { AUTH_ROUTE } from "utils/CONSTS";
import { useAxios } from "../hooks";
import axiosInstance from "utils/axiosInstance";
import { useEffect } from "react";
import { UserType } from "schemas";
import { Loading } from "../components/Loading";
import { Skeleton } from "../components/Skeleton";
import { useRouter } from "../router-events";
import { MdKeyboardArrowDown } from "react-icons/md";
import { logout } from "services/userAuth";
import useSWR from "swr";

// TODO:separate user's logic in separate class/service

export default function ProfilePopover() {
  const { push } = useRouter();
  const {
    data,
    isLoading: loading,
    isValidating,
  } = useSWR("/me", () => axiosInstance.get<UserType>("/me"));
  const isLoading = loading || isValidating;
  return (
    <Popover>
      <PopoverTrigger className="inline-flex justify-center items-center group">
        <Avatar size={2}>
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-full" />
          ) : (
            <AvatarFallback className="uppercase">
              {data?.data.name.slice(0, 2)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex items-center truncate">
          {isLoading && <Skeleton className="w-16 h-3 rounded-md ml-2" />}
          {data && !isLoading && (
            <span className="truncate ml-2 text-sm font-medium dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-200">
              {data?.data.name}
            </span>
          )}
          <MdKeyboardArrowDown
            size={18}
            className="transition-transform shrink-0 ml-1 fill-current text-slate-400 group-data-[state=open]:rotate-180"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent align="end" className="origin-top-right min-w-[11rem]">
        {isLoading ? (
          <Loading />
        ) : (
          <div>
            <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-slate-200 dark:border-slate-700">
              <div className="font-medium text-slate-800 dark:text-slate-100">
                {data?.data.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                Administrator
              </div>
            </div>
            <div className="flex w-full items-start flex-col gap-1">
              <HeaderUpgradePlan />
              <Alert
                title="Sign out of your account?"
                action={
                  <Button
                    onClick={async () => {
                      if (await logout()) push(AUTH_ROUTE);
                    }}
                    variant={{ intent: "danger", size: "xs" }}
                  >
                    Yes,Sign-out
                  </Button>
                }
                trigger={
                  <button className="font-medium text-sm text-rose-500 flex gap-1 items-center py-1 px-3 hover:text-rose-600 hover:dark:text-rose-400">
                    <span>sign out</span>
                  </button>
                }
              >
                do you want to sign out of your account?
              </Alert>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
