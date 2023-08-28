"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogFooter,
} from "@/ui/components/headless/Dialog";
import { Textarea } from "../components/TextArea";
import { Button } from "../components/Button";
import * as Bowser from "bowser";
import { RadioGroup, RadioGroupItem } from "../components/RadioGroup";
import { IS_SERVER } from "utils/is_server";
import { MdFeedback } from "react-icons/md";

export default function FeedBackModal() {
  if (!IS_SERVER) {
    const browser = Bowser.getParser(window.navigator.userAgent);
    const browserName = browser.getBrowserName();
    const os = browser.getOS();
  }

  const [submitted, setSubbmitted] = useState(false);

  return (
    <Dialog>
      <DialogTrigger className="w-8 h-8 flex items-center data-[state=open]:bg-slate-200 justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600/80 rounded-full">
        <MdFeedback className="text-slate-500 dark:text-slate-400" />
      </DialogTrigger>
      <DialogContent className="p-5 relative z-10">
        {
          // Submitted
          submitted && (
            <div className="absolute inset-0 z-30 bg-slate-500/70 backdrop-blur-md flex items-center justify-center">
              <div></div>
            </div>
          )
        }
        <div className="space-y-6 p-0">
          <div>
            <DialogTitle className="text-2xl font-bold mb-1">
              Give Feedback
            </DialogTitle>
            <div className="text-sm">
              Our product depends on customer feedback to improve the overall
              experience!
            </div>
          </div>

          {/* Rate */}
          <section>
            <h3 className="text-xl leading-snug text-slate-800 dark:text-slate-100 font-bold mb-6">
              How likely would you recommend us to a friend or colleague?
            </h3>
            <div className="w-full max-w-xl">
              <RadioGroup defaultValue="4">
                <div className="relative">
                  <div
                    className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-slate-200 dark:bg-slate-700"
                    aria-hidden="true"
                  ></div>
                  <div className="relative flex justify-between w-full">
                    {Array.from(Array(5).keys()).map((i) => {
                      return (
                        <RadioGroupItem
                          unstyled
                          value={(i + 1).toString()}
                          key={i}
                          className="flex group"
                          asChild
                        >
                          <div>
                            <button className="w-4 h-4 rounded-full group-data-[state=checked]:bg-indigo-500 group-data-[state=checked]:border-indigo-500 bg-white group-data-[state=unchecked]:dark:bg-slate-800 border-2 group-data-[state=unchecked]:border-slate-400 group-data-[state=unchecked]:dark:border-slate-500">
                              <span className="sr-only">{i + 1}</span>
                            </button>
                          </div>
                        </RadioGroupItem>
                      );
                    })}
                  </div>
                </div>
              </RadioGroup>

              <div className="w-full flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-2">
                <div>Not at all</div>
                <div>Extremely likely</div>
              </div>
            </div>
          </section>

          {/* Tell us in words */}
          <section>
            <h3 className="text-xl leading-snug text-slate-800 dark:text-slate-100 font-bold mb-2">
              Tell us in words
            </h3>
            <Textarea minRows={4} placeholder="I really enjoy…" />
          </section>
        </div>

        <DialogFooter className="flex flex-col border-t border-slate-200 dark:border-slate-700 px-0 mt-4">
          <div className="flex self-end gap-2 items-center">
            <DialogClose asChild>
              <Button variant={{ intent: "secondary", size: "sm" }}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant={{ intent: "primary", size: "sm" }}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
