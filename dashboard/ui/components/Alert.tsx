import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./headless/AlertDialog";
import { Button } from "./Button";
import cn from "../utils/cn";
import { AiOutlineInfo } from "react-icons/ai";

function Alert({
  type = "info",
  trigger,
  cancel,
  action,
  icon,
  title,
  children,
  asChild = false,
}: {
  trigger: React.ReactNode;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  children?: React.ReactNode;
  cancel?: React.ReactNode;
  action: React.ReactNode;
  type?: "danger" | "success" | "info";
  asChild?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="flex flex-row items-start gap-4">
        {icon ? (
          icon
        ) : (
          <div
            data-role="icon"
            className={cn(
              "rounded-full w-10 h-10 flex-center",
              type === "info" &&
                "bg-indigo-100 dark:bg-indigo-500/30 [&>div]:bg-indigo-500",
              type === "danger" &&
                "bg-rose-100 dark:bg-rose-500/30 [&>div]:bg-rose-500",
              type === "success" &&
                "bg-emerald-100 dark:bg-emerald-500/30 [&>div]:bg-emerald-500"
            )}
          >
            <div className="w-5 h-5 flex-center text-white rounded-full p-0.5 text-xl">
              <AiOutlineInfo />
            </div>
          </div>
        )}
        <div className="flex-1 shrink-0">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription asChild={asChild}>
              {children}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              {cancel ? (
                cancel
              ) : (
                <Button variant={{ intent: "secondary", size: "xs" }}>
                  Cancel
                </Button>
              )}
            </AlertDialogCancel>
            <AlertDialogAction asChild>{action}</AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default Alert;
