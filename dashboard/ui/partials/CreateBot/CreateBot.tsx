"use client";
import { useForm, Formiz, FormizStep } from "@formiz/core";
import { useRef, useState } from "react";
import { FinishStep, IntroStep, ValidateSwaggerStep } from "./steps";
import * as v from "valibot";
import { CreateBotSchema } from "schemas";
import { useStatus } from "@/ui/hooks";
import { Copilot, createCopilot, createDemoCopilot } from "api/copilots";
import cn from "@/ui/utils/cn";
import { Loading } from "@/ui/components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/ui/components/Button";
import Link from "next/link";
import {
  DialogFooter,
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/ui/components/headless/Dialog";
import { Heading } from "@/ui/components/Heading";
import { FileInput } from "@/ui/components/inputs/FileField";
import { BsCheck2Circle } from "react-icons/bs";
import { megabytesToBytes } from "utils/misc";

export default function CreateBot() {
  const form = useForm();
  const introRef = useRef<HTMLDivElement>(null);
  const [createdBot, setCreatedBot] = useState<Copilot | undefined>();
  const [, setSt, is] = useStatus();

  const handleSubmit = async (values: unknown) => {
    setCreatedBot(undefined);
    const dataSafe = v.safeParse(CreateBotSchema, values);
    if (dataSafe.success) {
      setSt("pending");
      const data = dataSafe.data;
      const res = await createCopilot({
        swagger_file: data.json_files[0],
      })
        .then((response) => {
          console.log(response.data.chatbot);
          setCreatedBot(response.data.chatbot);
          form.nextStep();
        })
        .catch((c) => {
          console.log(c);
          setSt("rejected");
        });
    } else {
      console.log(dataSafe.error.issues);
    }
    setSt("resolved");
  };

  async function createDemoBot() {
    setSt("pending");
    createDemoCopilot()
      .then(({ data }) => {
        if (data) {
          setCreatedBot(data.chatbot);
        }
        setSt("resolved");
      })
      .catch((c) => {
        console.log(c);
        setSt("rejected");
      })
      .finally(() => {
        form.nextStep();
      });
  }
  return (
    <div className="w-full z-[1] overflow-hidden relative">
      {/* form stepper */}
      <div className="max-w-md mx-auto w-full mb-16">
        <div>
          <ul className="relative flex justify-between w-full">
            <div className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-slate-200" />
            {form.steps?.map((step, i) => (
              <li key={i} className="relative">
                <span
                  onClick={() => {
                    if (step.isVisited && !step.isCurrent) {
                      form.goToStep(step.name);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-center select-none w-6 h-6 rounded-full text-xs font-semibold transition animate-in",
                    step.isCurrent || step.isVisited
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {step.index + 1}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Formiz connect={form} onValidSubmit={handleSubmit} autoForm>
        <IntroStep form={form} ref={introRef} />
        <FormizStep name="swagger_file">
          <div>
            <div>
              <Heading level={3} className="font-bold mb-6">
                Upload your swagger.json file ✨
              </Heading>
            </div>
            <div>
              You copilot will use these APIs to communicate with your product
              and execute actions
            </div>
            <div className="my-5">
              <FileInput
                name="json_files"
                maxSize={megabytesToBytes(2)}
                maxFiles={1}
                accept={{
                  "application/json": [".json"],
                }}
              />
            </div>
            <div className="w-full my-14 flex-center">
              <span>
                <strong>🪄 OR 🪄</strong>
              </span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="whitespace-normal mb-6"
                  variant={{ intent: "primary-ghost" }}
                >
                  Use our pre-made demo swagger file to try it out quickly
                  (🐶pet store SaaS system)
                </Button>
              </DialogTrigger>
              <DialogContent className="relative">
                {is("resolved") && createdBot && (
                  <div className="absolute inset-0 backdrop-blur-sm z-30">
                    <div className="w-full h-full flex items-center justify-center">
                      <BsCheck2Circle className="text-8xl text-emerald-500 fill-current" />
                    </div>
                  </div>
                )}

                <DialogHeader className="text-4xl flex items-center justify-center w-full border-none">
                  <span>🐶🐕</span>
                </DialogHeader>
                <div className="mt-5 px-5">
                  <h2 className="text-center text-lg font-semibold">
                    Pet Store Demo
                  </h2>
                  <p className="mt-2 text-center text-sm">
                    In this pet store you can add, delete, update and view pets,
                    you can also search and manage inventory, and finally you
                    can place orders . We already configured the APIs and the
                    backend, you can test it almost immediately.
                  </p>
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    loading={is("pending")}
                    variant={{ intent: "success" }}
                    onClick={createDemoBot}
                  >
                    <span className={cn(is("pending") && "opacity-0")}>
                      Let's do it
                    </span>
                    {is("pending") && (
                      <Loading size={20} wrapperClassName="inset-0 absolute" />
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="flex items-center justify-between space-x-6 mb-8 mt-4">
              <div>
                <div className="font-medium text-slate-800 text-sm mb-1">
                  Important Instructions
                </div>
                <div className="text-xs">
                  <ul>
                    <li>
                      ✅ Make sure each{" "}
                      <strong>
                        endpoint have description and operation id
                      </strong>
                      , results will be significantly better with a good
                      description
                    </li>
                    <li>
                      ✅ Make sure that the swagger file is valid, the system
                      might not be able to parse invalid files,{" "}
                      <Link href="https://editor.swagger.io/" target="_blank">
                        use this tool validate your schema
                      </Link>
                    </li>
                    <li>
                      ✅ Do not add any Authorization layers, we will show you
                      how to authorize your own requests by yourself
                    </li>
                    <li>
                      ✅ This *very* new product, so many things does not make
                      sense/work at this stage{" "}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <footer className="w-full flex items-center justify-between gap-5 pt-5">
              <Button
                variant={{ intent: "base" }}
                className="flex items-center justify-center gap-1 underline"
                onClick={() => form.prevStep()}
              >
                Back
              </Button>

              <Button
                variant={{ intent: "primary" }}
                onClick={() => form.submit()}
                disabled={form.isSubmitted || !form.isValid}
              >
                Next Step {`->`}
              </Button>
            </footer>
          </div>
        </FormizStep>
        <ValidateSwaggerStep form={form} createdBot={createdBot} />
        <FinishStep form={form} createdBot={createdBot} />
      </Formiz>
      <AnimatePresence>
        {is("pending") && (
          <motion.div
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute backdrop-blur-sm inset-0 bg-opacity-50 flex-center"
          >
            <Loading size={50} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
