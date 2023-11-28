"use client";
import { DropZone } from "@/components/domain/DropZone";
import { HeaderShell } from "@/components/domain/HeaderShell";
import Roadmap from "@/components/ui/Roadmap";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/router-events";
import React, { useState } from "react";
import { Wizard, useWizard } from "react-use-wizard";
import { ValidateSwaggerStep } from "./_parts/ValidateSwaggerStep";
import { Check, CheckCheck, FileVideo } from "lucide-react";
import { CopilotType, createCopilot } from "@/data/copilot";
import _ from "lodash";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/ui/Loader";
import {
  CreateCopilotProvider,
  useCreateCopilot,
} from "./_parts/CreateCopilotProvider";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SwaggerUi } from "./_parts/swagger-form";
import { FormValuesWithId } from "./_parts/swagger-form/types";
import { useConfetti } from "@/app/_store/atoms/confetti";

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
// lodash is the best 
const generateSwaggerDefinition = (formData: FormValuesWithId[]) => {
  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Your API',
      version: '1.0.0',
      description: 'API description',
    },
    paths: {},
  };

  _.forEach(formData, (api) => {
    const { title, url, parameters, headers, summary } = api;
    const pathId = title.replace(/\s/g, '');
    _.set(swaggerDefinition.paths, [url, pathId], {
      summary,
      description: summary,
      operationId: _.camelCase(title),
      parameters: _.map(parameters, (value, key) => ({
        name: key,
        in: 'query',
        description: `Description for ${key}`,
        required: true,
        schema: { type: 'string' },
      })),
      headers: _.map(headers, (value, key) => ({
        name: key,
        description: `Description for ${key}`,
        required: true,
        schema: { type: 'string' },
      })),
    });
  });

  return swaggerDefinition;
};
function UploadSwaggerStep() {
  const { pop: popConfetti } = useConfetti()
  const { nextStep, previousStep } = useWizard();
  const {
    state: { swaggerFiles, createdCopilot, swaggerEndpoints },
    dispatch,
  } = useCreateCopilot();
  const setCopilot = (copilot: CopilotType) => {
    dispatch({ type: "SET_COPILOT", payload: copilot });
  };
  const [loading, setLoading] = useState(false);
  const swaggerFile = _.first(swaggerFiles);
  const bothSelected = swaggerFile && !_.isEmpty(swaggerEndpoints);
  // spagetti 🍝
  async function handleCreateCopilot() {
    if (!swaggerFile && _.isEmpty(swaggerEndpoints)) {
      toast({
        title: "No swagger file uploaded or created!",
        description:
          "Please upload a swagger file to continue, or create one using the form",
        variant: "destructive",
      });
      return;
    }
    if (bothSelected) {
      toast({
        title: "Both swagger file and swagger definition created!",
        description:
          "Please reset one of them to continue, you can't use both at the same time",
        variant: "destructive",
      });
      return;
    }
    else {
      setLoading(true);
      try {
        if (!createdCopilot) {
          if (swaggerFile) {
            const res = await createCopilot({
              swagger_file: swaggerFile,
            });
            if (res.data) {
              setCopilot(res.data.chatbot);
              toast({
                title: "Copilot Created Successfully",
                description: "You have created your copilot successfully",
                variant: "success",
              });
              popConfetti(5)
              _.delay(nextStep, 1000);
            }
          }
          if (!_.isEmpty(swaggerEndpoints)) {
            const swaggerDefinition = generateSwaggerDefinition(swaggerEndpoints);
            const swagger_file = new File([JSON.stringify(swaggerDefinition)], "swagger.json", {
              type: "application/json",
            })
            console.log(swagger_file);
            const res = await createCopilot({
              swagger_file,
            });
            if (res.data) {
              setCopilot(res.data.chatbot);
              toast({
                title: "Copilot Created Successfully",
                description: "You have created your copilot successfully",
                variant: "success",
              });
              popConfetti(5)
              _.delay(nextStep, 1000);
            }
          }
        }
      } catch (error) {
        setLoading(false);
      }

    }
    setLoading(false);
  }
  return (
    <div className="relative p-1">
      {loading && (
        <div className="flex-center absolute inset-0 z-40 bg-white/20 backdrop-blur-sm">
          <Loader />
        </div>
      )}
      <h2 className="mb-6 text-3xl font-bold text-accent-foreground">
        Define your actions ✨
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
      <Tabs defaultValue="swagger-form">
        <TabsList className="relative">
          <TabsTrigger value="swagger-form" className="flex-1">
            Add actions via UI
          </TabsTrigger>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none rounded-full bg-muted p-1.5 text-sm font-semibold uppercase text-accent-foreground">
            OR
          </div>
          <TabsTrigger value="upload" className="flex-1">
            Upload Swagger
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="min-h-[10rem]">
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
        </TabsContent>
        <TabsContent value="swagger-form" className="min-h-[10rem]">
          <SwaggerUi />
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
        {createdCopilot ? (
          <>
            <Button
              onClick={nextStep}
              className="flex items-center justify-center gap-1"
            >
              Next
            </Button>
          </>
        ) : (
          // handle if user uploaded swagger file and created swagger definition at the same time.
          // so user have to choose which one to use.
          <>
            <Button onClick={handleCreateCopilot}>
              Create Copilot
            </Button>
          </>
        )}
      </footer>
    </div>
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
// create/copilot/
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
              <UploadSwaggerStep />
              <ValidateSwaggerStep />
              <FinishStep />
            </Wizard>
          </CreateCopilotProvider>
        </div>
      </div>
    </div>
  );
}
