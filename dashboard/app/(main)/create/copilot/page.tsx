"use client";
import { DropZone } from "@/components/domain/DropZone";
import { HeaderShell } from "@/components/domain/HeaderShell";
import Roadmap from "@/components/ui/Roadmap";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Wizard, useWizard } from "react-use-wizard";
import { ValidateSwaggerStep } from "./_parts/ValidateSwaggerStep";
import { Cat, Check, CheckCheck } from "lucide-react";
import {
  CopilotType,
  PetStoreCopilotType,
  createCopilot,
  createPetstoreTemplate,
} from "@/data/copilot";
import type { AxiosResponse } from "axios";
import _ from "lodash";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Loader from "@/components/ui/Loader";

type PremadeTemplate<T> = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  // we dont know the type of the response it depends on the selected template so we want to keep it generic
  creatorFn: (...args: any[]) => Promise<AxiosResponse<T>>;
};
const petStoreTemplate: PremadeTemplate<PetStoreCopilotType> = {
  id: "pet_store",
  name: "Pet Store",
  description: "Simple Pet store templeate with crud operations",
  icon: <Cat className="h-6 w-6" />,
  creatorFn: createPetstoreTemplate,
};
const premadeTemplates = [petStoreTemplate];
const loadingAtom = atom(false);
const CreatedCopilotAtom = atom<CopilotType | null>(null);
const swaggerAtom = atom<File[] | null>(null);
const selectedTemplateAtomKey = atom<string | undefined>(undefined);

const WizardDataStateAtom = atom((get) => ({
  createdCopilot: get(CreatedCopilotAtom),
  swaggerFile: _.first(get(swaggerAtom)),
  selectedTemplate: premadeTemplates.find(
    (temp) => temp.id === get(selectedTemplateAtomKey),
  ),
  is_premade_demo_template: get(CreatedCopilotAtom)?.is_premade_demo_template,
}));

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
              label: "Your API definition (Swagger)",
              description:
                "We will use this definition to give your copilot the ability of understanding your product.",
            },
            {
              label: "We validate your API definition",
              description:
                "We will validate your swagger file to make sure that it is valid and that we can understand it.",
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
function UploadSwaggerStep() {
  const { nextStep, previousStep } = useWizard();
  const [swaggerFiles, setSwaggerFiles] = useAtom(swaggerAtom);
  const setCopilot = useSetAtom(CreatedCopilotAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const {
    createdCopilot,
    selectedTemplate,
    swaggerFile,
    is_premade_demo_template,
  } = useAtomValue(WizardDataStateAtom);
  console.log({
    is_premade_demo_template,
    createdCopilot,
    selectedTemplate,
    swaggerFile,
  });
  const [templateKey, setTempleteKey] = useAtom(selectedTemplateAtomKey);
  // if user selects template and then uploads swagger file, we will use the template
  const bothSelected = selectedTemplate && swaggerFile;

  async function handleCreateCopilot() {
    setLoading(true);
    if (!swaggerFile && !selectedTemplate) {
      toast({
        title: "No swagger file uploaded or template selected",
        description:
          "Please upload a swagger file to continue, or select a template",
        variant: "destructive",
      });
    } else {
      if (!createdCopilot) {
        const template = selectedTemplate;
        if (template) {
          const res = await template.creatorFn();
          if (res.data) {
            setCopilot(res.data.chatbot);
          }
        } else {
          const res = await createCopilot({ swagger_file: swaggerFile });
          if (res.data) {
            setCopilot(res.data.chatbot);
          }
        }
        // if copilot created successfully.
        // we will go to the next step
        if (createdCopilot) {
          toast({
            title: "Copilot Created Successfully",
            description: "You have created your copilot successfully",
            variant: "success",
          });
          await _.after(1000, nextStep)();
        }
      } else {
        await _.after(1000, nextStep)();
      }
    }
    setLoading(false);
  }

  function handleRadioChange(value: string) {
    if (value === templateKey && templateKey !== "undefined") {
      setTempleteKey(undefined);
    } else {
      setTempleteKey(value);
    }
  }
  return (
    <div className="relative p-1">
      {loading && (
        <div className="flex-center absolute inset-0 z-40 bg-white/20 backdrop-blur-sm">
          <Loader />
        </div>
      )}
      <h2 className="mb-6 text-3xl font-bold text-accent-foreground">
        Upload your swagger.json file ✨
      </h2>

      {createdCopilot && (
        <Alert variant="info" className="my-2">
          <AlertTitle>Copilot Created Successfully</AlertTitle>
          <AlertDescription>
            You have created <strong>{createdCopilot?.name}</strong>
          </AlertDescription>
        </Alert>
      )}
      <p className="mb-4">
        You copilot will use these APIs to communicate with your product and
        execute actions
      </p>
      <Tabs defaultValue="upload">
        <TabsList className="relative">
          <TabsTrigger value="upload" className="flex-1">
            Upload Swagger
          </TabsTrigger>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none rounded-full bg-muted p-1.5 text-sm font-semibold uppercase text-accent-foreground">
            OR
          </div>
          <TabsTrigger value="premade" className="flex-1">
            Pre-made Copilots
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="min-h-[10rem]">
          <div className="my-5">
            <DropZone
              multiple={false}
              maxFiles={1}
              accept={{ json: ["application/json"] }}
              value={swaggerFiles || []}
              onChange={setSwaggerFiles}
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
        </TabsContent>
        <TabsContent value="premade" className="min-h-[10rem]">
          <Label className="my-4 block text-base font-semibold text-accent-foreground">
            Choose a pre-made template
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {_.map(premadeTemplates, ({ id, name, icon, description }) => (
              <TooltipProvider key={id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      data-value={id}
                      data-state={id === templateKey ? "checked" : "unchecked"}
                      onClick={() => handleRadioChange(id)}
                      className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-border p-3 shadow-sm transition-all data-[state=checked]:border-primary data-[state=checked]:text-primary data-[state=checked]:shadow-inner data-[state=checked]:shadow-primary-foreground"
                    >
                      <span className="text-2xl drop-shadow">{icon}</span>
                      <span className="text-sm font-semibold">{name}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{description}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <footer className="flex w-full items-center justify-between gap-5 pt-5">
        <Button
          variant="ghost"
          onClick={previousStep}
          className="flex items-center justify-center gap-1 underline"
        >
          Back
        </Button>
        {/* user didn't select both */}
        {!bothSelected && (
          <Button
            onClick={handleCreateCopilot}
            className="flex items-center justify-center gap-1"
          >
            Create Copilot
          </Button>
        )}
        {/* user selected both, and no copilot */}
        {!createdCopilot && bothSelected && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="flex items-center justify-center gap-1">
                Create Copilot
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to create this copilot?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
                You are about to create a copilot with a pre-made template, this
                will override your current swagger file.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="destructive" size="sm">
                    Cancel
                  </Button>
                </AlertDialogCancel>
                <Button onClick={handleCreateCopilot} size="sm">
                  Create Copilot
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </footer>
    </div>
  );
}
function FinishStep() {
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
          <Link href="">Open your copilot 🔥 {`->`}</Link>
        </Button>
      </div>
    </div>
  );
}
// create/copilot/
export default function CreateCopilotPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <HeaderShell>
        <h1 className="text-lg font-bold text-accent-foreground">
          Create new Copilot
        </h1>
      </HeaderShell>

      <div className="flex-center w-full flex-1 shrink-0 overflow-auto p-5">
        <div className="mx-auto mb-5 h-full w-full max-w-lg [&>div]:pb-8">
          <Wizard header={<Header />}>
            <IntroStep />
            <UploadSwaggerStep />
            <ValidateSwaggerStep />
            <FinishStep />
          </Wizard>
        </div>
      </div>
    </div>
  );
}
