"use client";
import { HeaderShell } from "@/components/domain/HeaderShell";
import Roadmap from "@/components/ui/Roadmap";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/router-events";
import React, { useState } from "react";
import { Wizard, useWizard } from "react-use-wizard";
import { Check, CheckCheck, FileVideo } from "lucide-react";
import Loader from "@/components/ui/Loader";
import {
  CreateCopilotProvider,
  useCreateCopilot,
} from "./CreateCopilotProvider";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SetCopilotName } from "./SetCopilotNameStep";
import { DefineActionsStep } from "./DefineActionsStep";
import { motion } from "framer-motion";

function Header() {
  const { stepCount, activeStep, goToStep } = useWizard();
  const steps = Array.from({ length: stepCount }).map((_, i) => ({
    index: i,
    name: `step-${i}`,
    isCurrent: i === activeStep,
    isVisited: i < activeStep,
    isLast: i === stepCount - 1,
  }));
  return (
    <div className="mb-4 mt-8">
      <ul className="relative flex w-full justify-between">
        <div className="absolute left-0 top-1/2 -mt-px h-0.5 w-full bg-slate-200" />
        {steps.map((step, i) => (
          <li key={i} className="relative">
            <span
              onClick={() => {
                if (step.isVisited && !step.isCurrent) {
                  goToStep(step.index);
                }
              }}
              className={cn(
                "flex h-6 w-6 select-none items-center justify-center rounded-full text-xs font-semibold text-primary-foreground transition animate-in",
                step.isCurrent || step.isVisited
                  ? step.isLast
                    ? "bg-emerald-500 text-white"
                    : "bg-primary text-white"
                  : "bg-slate-100 text-accent-foreground",
              )}
            >
              {step.isLast ? (
                <Check className="h-4 w-4" strokeWidth="3" />
              ) : (
                step.index + 1
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
function IntroStep() {
  const { nextStep } = useWizard();
  return (
    <motion.div>
      <h2 className="mb-6 text-3xl font-bold text-accent-foreground">
        Let's create your own product copilot 🔥
      </h2>
      <p className="mb-2 font-medium">And here how we are going to do it:</p>
      <div className="my-6 px-1.5">
        <Roadmap
          items={[
            {
              label: "Your API definition (actions)",
              description:
                "We will use this definition to give your copilot the ability of understanding your product.",
            },
            {
              label: "We validate your API definition",
              description:
                "We will validate your actions/apis to make sure that it is valid and that we can understand it.",
            },
            {
              label: "You integrate the copilot on your product",
              description:
                "That is it! we will provide you with a Javascript code to put it on your product.",
            },
          ]}
        />
      </div>
      <div className="flex items-center justify-end">
        <Button onClick={nextStep}>Let's do it!</Button>
      </div>
    </motion.div>
  );
}

function FinishStep() {
  const {
    state: { createdCopilot },
  } = useCreateCopilot();
  const BaseCopilot = `/copilot/${createdCopilot?.id}`;
  return (
    <div>
      <h2 className="mb-6 flex flex-col items-center justify-center gap-2 font-bold">
        <span className="inline-flex rounded-full bg-emerald-100 fill-current p-2.5 text-6xl text-emerald-500">
          <CheckCheck className="h-[1em] w-[1em]" />
        </span>
        <span className="text-3xl">That's it! 🙌</span>
      </h2>
      <div className="mx-auto mt-5 w-fit">
        <Button asChild>
          <Link href={BaseCopilot}>Open your copilot 🔥</Link>
        </Button>
      </div>
    </div>
  );
}
function MotionWrapper({ children }: { children?: React.ReactNode }) {
  const { activeStep } = useWizard();
  const isFirstStep = activeStep === 0;
  return (
    <motion.div
      key={activeStep}
      variants={{
        leave: { opacity: 0, filter: "blur(10px)" },
        enter: { opacity: 1, filter: "blur(0px)" },
      }}
      initial={isFirstStep ? "enter" : "leave"}
      animate="enter"
      exit="leave"
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
export default function CreateCopilotPage() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <HeaderShell className="justify-between">
        <h1 className="text-lg font-bold text-accent-foreground">
          Create new Copilot
        </h1>
        <div>
          <Dialog>
            <DialogContent className="overflow-hidden p-0">
              <div className="relative h-full w-full">
                {!loaded && (
                  <div className="flex-center absolute inset-0">
                    <Loader />
                  </div>
                )}
                <iframe
                  className={cn(
                    "aspect-video w-full transition-opacity",
                    loaded ? "opacity-100" : "opacity-0",
                  )}
                  src="https://www.youtube.com/embed/-TgrM_6G_yA?si=eTOWsEeSQM5bYsg_"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => setLoaded(true)}
                />
              </div>
            </DialogContent>
            <DialogTrigger asChild>
              <Button variant="secondary" className="flex-center gap-2">
                Watch video tutorial
                <FileVideo className="h-5 w-5" />
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </HeaderShell>

      <div className="flex-center w-full flex-1 shrink-0 overflow-auto p-5">
        <div className="mx-auto mb-5 h-full w-full max-w-lg [&>div]:pb-8">
          <CreateCopilotProvider>
            <Wizard header={<Header />} wrapper={<MotionWrapper />}>
              <IntroStep />
              <SetCopilotName />
              <DefineActionsStep />
              <FinishStep />
            </Wizard>
          </CreateCopilotProvider>
        </div>
      </div>
    </div>
  );
}
