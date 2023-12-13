"use client";
import { DropZone } from "@/components/domain/DropZone";
import { HeaderShell } from "@/components/domain/HeaderShell";
import Roadmap from "@/components/ui/Roadmap";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/router-events";
import React, { useState } from "react";
import { Wizard, useWizard } from "react-use-wizard";
import { Check, CheckCheck, FileVideo, Plus, Trash2, Upload } from "lucide-react";
import { CopilotType, createCopilot } from "@/data/copilot";
import _ from "lodash";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Loader from "@/components/ui/Loader";
import {
  CreateCopilotProvider,
  useCreateCopilot,
} from "./_parts/CreateCopilotProvider";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useConfetti } from "@/app/_store/confetti";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAsyncFn } from "react-use";
import { createActionByBotId, getActionsByBotId, importActionsFromSwagger } from "@/data/actions";
import useSWR from "swr";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import { ActionForm } from "@/components/domain/action-form/ActionForm";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { revalidateActions } from "@/components/domain/new-flows-editor/Controller";
import { methodVariants } from "@/components/domain/MethodRenderer";
import { atom, useAtom } from "jotai";

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
    <div>
      <h2 className="mb-6 text-3xl font-bold text-accent-foreground">
        Let's create your own product copilot 🔥
      </h2>
      <p className="mb-2">And here how we are going to do it:</p>
      <div className="my-8 px-2">
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
    </div>
  );
}
function SetCopilotName() {
  const { state: { copilot_name, createdCopilot }, dispatch } = useCreateCopilot();
  const { nextStep } = useWizard();
  const { pop: popConfetti } = useConfetti();
  const [value, $createCopilot] = useAsyncFn(createCopilot);

  const setCopilot = (copilot: CopilotType) => {
    dispatch({ type: "SET_COPILOT", payload: copilot });
    popConfetti();
  };

  async function handleCreateCopilot() {
    if (!copilot_name) return;
    if (createdCopilot) {
      nextStep();
      return;
    }
    const response = await $createCopilot(copilot_name);
    if (response.data.id) {
      setCopilot(response.data);
      nextStep();
    } else {
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  }
  return <div>
    <h2 className="mb-6 text-3xl font-bold text-accent-foreground">
      Let's give your copilot a name 🤖
    </h2>
    <div className="px-2 my-4">
      <Label htmlFor="copilotName" className="font-semibold">
        Copilot Name
      </Label>
      <Input id="copilotName"
        disabled={!!createdCopilot}
        className="mt-1" value={copilot_name ?? ''} onChange={(ev) => dispatch({ type: "CHANGE_NAME", payload: ev.target.value })} />
    </div>
    <div className="flex items-center justify-end">
      <Button onClick={handleCreateCopilot}
        disabled={!copilot_name}
        loading={value.loading}>Let's do it!</Button>
    </div>
  </div>
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
        <span className="text-3xl">Thats it! 🙌</span>
      </h2>
      <div className="mx-auto mt-5 w-fit">
        <Button asChild>
          <Link href={BaseCopilot}>Open your copilot 🔥</Link>
        </Button>
      </div>
    </div>
  );
}
const formDialog = atom({
  swagger: false,
  manually: false
})
function DefineActionsStep() {
  const { nextStep, previousStep } = useWizard();
  const [state, $importActionsFromSwagger] = useAsyncFn(importActionsFromSwagger)
  const [addActionState, $addAction] = useAsyncFn(createActionByBotId)
  const {
    state: { swaggerFiles, createdCopilot },
    dispatch,
  } = useCreateCopilot();
  const [dialogs, setDialogs] = useAtom(formDialog)
  const { data: actions } = useSWR(createdCopilot ? (createdCopilot?.id + '/actions') : null, async () => createdCopilot?.id ? await getActionsByBotId(createdCopilot?.id) : null)
  async function addActionFromSwagger() {
    const swaggerFile = _.first(swaggerFiles);
    if (swaggerFile && createdCopilot) {
      const response = await $importActionsFromSwagger(createdCopilot.id, swaggerFile)
      if (response.data) {
        toast({
          title: "Actions imported successfully",
          description: "We have imported your actions successfully",
          variant: "success",
        });
      }
      // reset swagger files
      dispatch({
        type: "ADD_SWAGGER",
        payload: null,
      });
      setDialogs({
        ...dialogs,
        swagger: false
      })
    }
  }
  return (
    <div className="relative p-1">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-accent-foreground">
          Define your actions ✨
        </h2>
      </div>
      {createdCopilot && (
        <Alert variant="info" className="my-2">
          <AlertTitle>Copilot Created Successfully</AlertTitle>
          <AlertDescription>
            You have created <strong>{createdCopilot?.name}</strong>
          </AlertDescription>
        </Alert>
      )}

      <p className="mb-2">
        You copilot will use these APIs to communicate with your product and
        execute actions
      </p>
      <div className="flex items-center mb-2 space-x-2 justify-end">
        <AlertDialog open={dialogs.manually} onOpenChange={(open) => setDialogs({
          ...dialogs,
          manually: open,
        })}>
          <AlertDialogContent>
            <AlertDialogHeader className="flex items-center justify-between w-full flex-row">
              <AlertDialogTitle className="flex-1 text-lg font-bold">
                Define API action
              </AlertDialogTitle>
            </AlertDialogHeader>
            <ActionForm
              onSubmit={async (values) => {
                if (createdCopilot) {
                  const { data } = await $addAction(createdCopilot.id, values);
                  if (data) {
                    toast({
                      title: "Action created successfully",
                      description: "We have created your action successfully",
                      variant: "success",
                    });
                    setDialogs({
                      ...dialogs,
                      manually: false
                    })
                    revalidateActions(createdCopilot.id)
                  }
                }
              }}
              footer={
                () => <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button variant='outline'>Cancel</Button>
                  </AlertDialogCancel>
                  <Button type="submit" loading={addActionState.loading}>Import</Button>
                </AlertDialogFooter>
              } />
          </AlertDialogContent>
          <AlertDialogTrigger asChild>
            <Button className="space-x-1" size='xs' variant='secondary'>
              <span>
                Add Action
              </span>
              <Plus className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
        </AlertDialog>
        <AlertDialog open={dialogs.swagger} onOpenChange={(open) => setDialogs({
          ...dialogs,
          swagger: open,
        })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex-1 text-lg font-bold">
                Import from Swagger
              </AlertDialogTitle>
            </AlertDialogHeader>
            <GetActionsFromSwagger />
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant='outline'>Cancel</Button>
              </AlertDialogCancel>
              <Button onClick={addActionFromSwagger} loading={state.loading}>Import</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
          <AlertDialogTrigger asChild >
            <Button className="space-x-1" size='xs' variant='secondary'>
              <span>
                Import from Swagger
              </span>
              <Upload className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
        </AlertDialog>
      </div>
      <div className="flex items-start flex-col gap-2 overflow-auto max-h-60 px-2 py-1">
        {
          _.isEmpty(actions?.data) ?
            <div className="mx-auto">
              <EmptyBlock>
                <div className="text-center text-sm">
                  <span className="block">
                    No endpoints added yet.
                  </span>
                  <span className="block">
                    You can add new acions via swagger files or manually
                  </span>
                </div>
              </EmptyBlock>
            </div>
            :
            _.map(actions?.data, (endpoint, index) => {
              return <div key={index} className="w-full p-2 shrink-0 flex overflow-hidden max-w-full gap-4 items-center justify-between border border-border transition-colors rounded-lg">
                <div className="flex-1 flex items-center justify-start overflow-hidden shrink-0">
                  <div className="flex items-center gap-5 overflow-hidden shrink-0">
                    <span className={cn(methodVariants({
                      method: endpoint.request_type
                    }))}>
                      {endpoint.request_type}
                    </span>
                    <p className="flex-1 line-clamp-1 overflow-ellipsis font-medium text-xs">
                      {endpoint.api_endpoint || endpoint.name}
                    </p>
                  </div>
                </div>
                <div className="space-x-2">
                  <button className="text-destructive">
                    <Trash2 className="w-4 h-4" onClick={() => confirm("are you sure")} />
                  </button>
                </div>
              </div>
            })
        }
      </div>

      <footer className="flex w-full items-center justify-between gap-5 pt-5">
        <Button
          variant="ghost"
          onClick={previousStep}
          className="flex items-center justify-center gap-1 underline"
        >
          Back
        </Button>
        {createdCopilot && (
          <Button onClick={nextStep}>
            {
              _.isEmpty(actions?.data) ? "Skip" : "Next"
            }
          </Button>
        )}
      </footer>
    </div >
  );
}

function GetActionsFromSwagger() {
  const { state: { swaggerFiles }, dispatch } = useCreateCopilot();
  return <div>
    <div className="my-5">
      <DropZone
        multiple={false}
        maxFiles={1}
        accept={{ json: ["application/json"] }}
        value={swaggerFiles || []}
        onChange={(files) => {
          dispatch({ type: "ADD_SWAGGER", payload: files });
        }}
      />
    </div>
    <div className="mb-8 mt-4 flex items-center justify-between space-x-6">
      <div>
        <div className="mb-1 text-sm font-medium text-slate-800">
          Important Instructions
        </div>
        <div className="text-xs">
          <ul>
            <li>
              ✅ Make sure each{" "}
              <strong>endpoint have description and operation id</strong>,
              results will be significantly better with a good description
            </li>
            <li>
              ✅ Make sure that the swagger file is valid, the system
              might not be able to parse invalid files,{" "}
              <Link href="https://editor.swagger.io/" target="_blank">
                use this tool validate your schema
              </Link>
            </li>
            <li>
              ✅ Do not add any Authorization layers, we will show you how
              to authorize your own requests by yourself
            </li>
            <li>
              ✅ This *very* new product, so many things does not make
              sense/work at this stage{" "}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
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
                  src="https://www.youtube.com/embed/WqcNpE5yTNg?si=5NjK9Tfi3gIIZdJM"
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
            <Wizard header={<Header />}>
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
