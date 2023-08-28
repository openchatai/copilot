"use client";
import React from "react";
import { Switch, SwitchThumb } from "@radix-ui/react-switch";
import { useTheme } from "next-themes";
import { BsMoon } from "react-icons/bs";
import { FiSun } from "react-icons/fi";

export default function ThemeSwitch() {
  const { setTheme, theme } = useTheme();
  return (
    <Switch
      checked={theme === "dark"}
      onCheckedChange={(checked) => {
        checked === true ? setTheme("dark") : setTheme("light");
      }}
      className="group/switch flex items-center justify-center cursor-pointer w-8 h-8 rounded-full"
    >
      <span className="sr-only">Switch to light / dark version</span>
      <SwitchThumb className="flex items-center justify-center cursor-pointer w-8 h-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600/80 rounded-full">
        <BsMoon className="fill-current text-slate-400 w-4 h-4 animate-in slide-in-from-left-0 group-data-[state=checked]/switch:hidden" />
        <FiSun className="fill-current text-slate-400 w-4 h-4 animate-in fade-in-0 group-data-[state=unchecked]/switch:hidden" />
      </SwitchThumb>
    </Switch>
  );
}
