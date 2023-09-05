"use client";
import { useForm, Formiz } from "@formiz/core";
import { useRef, useState } from "react";
import {
  FinishStep,
  IntroStep,
  UploadSwaggerStep,
  ValidateSwaggerStep,
} from "./steps";
import * as v from "valibot";
import { CreateBotSchema } from "schemas";
import { useStatus } from "@/ui/hooks";
import { Copilot, createCopilot } from "api/copilots";
import cn from "@/ui/utils/cn";
import { Loading } from "@/ui/components/Loading";
import { motion, AnimatePresence } from "framer-motion";
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
          console.log("created");
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
  return (
    <div className="w-full z-[1] overflow-hidden relative">
      <div className="max-w-md mx-auto w-full mb-16">
        <div>
          <ul className="relative flex justify-between w-full">
            {form.steps?.map((step, i) => (
              <li key={i}>
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition animate-in",
                    step.isCurrent
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
        <UploadSwaggerStep form={form} />
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
