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
import { Cat, Check, CheckCheck, Slack, Trello } from "lucide-react";
import { CopilotType, createCopilot } from "@/data/copilot";
import _ from "lodash";
import { atom, useAtom } from "jotai";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RadioGroup,
  RadioGroupPrimitiveItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const premadeTemplates = [
  {
    id: "pet_store",
    name: "Pet Store",
    description: "Simple Pet store templeate with crud operations",
    icon: <Cat className="h-6 w-6" />,
  },
  {
    id: "terllo_clone",
    name: "Trello Clone",
    description: "A clone of trello with some basic operations",
    icon: <Trello className="h-6 w-6" />,
  },

  {
    id: "slack_clone",
    name: "Slack Clone",
    description: "A clone of slack with some basic operations",
    icon: <Slack className="h-6 w-6" />,
  },
];
const CreatedCopilotAtom = atom<CopilotType | null>(null);
const swaggerAtom = atom<File[] | null>(null);
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
  const { nextStep, previousStep, handleStep } = useWizard();
  const [swaggerFile, setSwaggerFile] = useAtom(swaggerAtom);
  const [copilot, setCopilot] = useAtom(CreatedCopilotAtom);
  handleStep(async () => {
    if (_.isEmpty(swaggerFile) || !swaggerFile || !swaggerFile?.[0]) {
      return;
    }
    const response = await createCopilot({ swagger_file: swaggerFile[0] });
    if (response.status === 200) {
      setCopilot(response.data.chatbot);
      toast({
        title: "Copilot created successfully",
        description:
          "We created a copilot for you, you can now continue the process",
        variant: "default",
      });
      return true;
    }
  });
  return (
    <div>
      <h2 className="mb-6 text-3xl font-bold text-accent-foreground">
        Upload your swagger.json file ✨
      </h2>

      {copilot && (
        <Alert variant="info" className="my-2">
          <AlertTitle>Copilot Created Successfully</AlertTitle>
          <AlertDescription>
            You have created <strong>{copilot?.name}</strong>
          </AlertDescription>
        </Alert>
      )}
      <p className="mb-4">
        You copilot will use these APIs to communicate with your product and
        execute actions
      </p>
      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload" className="flex-1">
            Upload Swagger
          </TabsTrigger>
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
              value={swaggerFile || []}
              onChange={setSwaggerFile}
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
          {/* <Dialog>
            <DialogTrigger asChild>
              <Button
                className="mb-6 h-fit whitespace-normal py-2"
                size="fluid"
              >
                Use our pre-made demo swagger file to try it out quickly <br />{" "}
                (🐶pet store SaaS system)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="flex w-full items-center justify-center border-none text-4xl">
                <span>🐶🐕</span>
              </DialogHeader>
              <div className="mt-5 px-5">
                <h2 className="text-center text-lg font-semibold">
                  Pet Store Demo
                </h2>
                <p className="mt-2 text-center text-sm">
                  In this pet store you can add, delete, update and view pets,
                  you can also search and manage inventory, and finally you can
                  place orders . We already configured the APIs and the backend,
                  you can test it almost immediately.
                </p>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  onClick={async () => {
                    if (!copilot) {
                      const { data: demoCopilotData } =
                        await createDemoCopilot();
                      setCopilot(demoCopilotData.chatbot);
                      toast({
                        title: "Demo Copilot created successfully",
                        description:
                          "We created a demo copilot for you, you can now continue the process",
                        variant: "default",
                      });
                    }
                  }}
                >
                  Let's do it
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog> */}
          <Label className="my-4 block text-base font-semibold text-accent-foreground">
            Choose a pre-made template
          </Label>
          <RadioGroup className="grid grid-cols-4 gap-2">
            {_.map(premadeTemplates, ({ id, name, icon, description }) => (
              <TooltipProvider key={id}>
                <Tooltip>
                  <RadioGroupPrimitiveItem
                    value={id}
                    asChild
                    className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-border p-3 shadow-sm transition-all data-[state=checked]:border-primary data-[state=checked]:text-primary data-[state=checked]:shadow-inner data-[state=checked]:shadow-primary-foreground"
                  >
                    <TooltipTrigger>
                      <span className="text-2xl drop-shadow">{icon}</span>
                      <span className="text-sm font-semibold">{name}</span>
                    </TooltipTrigger>
                  </RadioGroupPrimitiveItem>
                  <TooltipContent>{description}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </RadioGroup>
        </TabsContent>
      </Tabs>
      <footer className="flex w-full items-center justify-between gap-5 pt-5">
        <Button
          variant={"ghost"}
          onClick={previousStep}
          className="flex items-center justify-center gap-1 underline"
        >
          Back
        </Button>

        <Button hidden={copilot?.is_premade_demo_template} onClick={nextStep}>
          Next Step
        </Button>
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
