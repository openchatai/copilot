import React, { ComponentProps } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogClose,
} from "../components/headless/Dialog";
import { Button } from "../components/Button";
import { RadioGroup, RadioGroupItem } from "../components/RadioGroup";
import Alert from "../components/Alert";
/**
@description Upgrade plan radio group item
 */
function UpgradePlanRadioGroupItem({
  ...props
}: ComponentProps<typeof RadioGroupItem>) {
  return (
    <li>
      <RadioGroupItem
        {...props}
        unstyled
        className="group/item w-full h-full text-left py-3 px-4 rounded bg-white dark:bg-slate-800 border-2 data-[state=checked]:border-indigo-400 dark:data-[state=checked]:border-indigo-500 shadow-sm duration-150 ease-in-out border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      >
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 group-data-[state=checked]/item:border-4 border-slate-300 dark:border-slate-600 group-data-[state=checked]/item:border-indigo-500 bg-white rounded-full mr-3"></div>
          <div className="grow">
            <div className="flex flex-wrap items-center justify-between mb-0.5">
              <span className="font-medium text-slate-800 dark:text-slate-100">
                Mosaic Light{" "}
                <span className="text-xs italic text-slate-500 align-top">
                  Current Plan
                </span>
              </span>
              <span className="text-slate-600">
                <span className="font-medium text-emerald-600">$39.00</span>
                /mo
              </span>
            </div>
            <div className="text-sm">2 MB · 1 member · 500 block limits</div>
          </div>
        </div>
      </RadioGroupItem>
    </li>
  );
}
/**
@description Upgrade plan dialog used in the dashboard header not functional yet.
 */
function HeaderUpgradePlan() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="font-medium text-sm text-emerald-500 flex gap-1 items-center py-1 px-3 hover:text-emerald-600 hover:dark:text-emerald-400">
          <span>upgrade</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Change your Plan</DialogHeader>
        <div className="px-5 pt-4 pb-1">
          <div className="text-sm">
            <div className="mb-4">Upgrade or downgrade your plan:</div>
            {/* Options */}
            <RadioGroup asChild defaultValue="basic" className="space-y-2 mb-4">
              <ul>
                <UpgradePlanRadioGroupItem value="basic" />
                <UpgradePlanRadioGroupItem value="pro" />
                <UpgradePlanRadioGroupItem value="pro_2" />
              </ul>
            </RadioGroup>
            <div className="text-xs text-slate-500">
              Your workspace's Mosaic Light Plan is set to $39 per month and
              will renew on August 9, 2021.
            </div>
          </div>
        </div>
        <DialogFooter>
          <Alert
            trigger={
              <Button variant={{ intent: "primary", size: "sm" }}>
                Change Plan
              </Button>
            }
            title="Upgrade Your Plan?"
            type="info"
            action={
              <Button variant={{ size: "xs", intent: "primary" }}>
                upgrade
              </Button>
            }
          >
            are you sure you want to upgrade your plan?
          </Alert>
          <DialogClose asChild>
            <Button variant={{ intent: "secondary", size: "sm" }}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default HeaderUpgradePlan;
