"use client";
import { useForm, Formiz } from "@formiz/core";
import { useRef, useState } from "react";
import { Separator } from "../../components/Separator";
import { IntroStep, UploadSwaggerStep } from "./steps";
import { Footer } from "./Footer";
import { Loading } from "@/ui/components/Loading";
import * as v from "valibot";
import { CreateBotSchema } from "schemas";
import { useStatus } from "@/ui/hooks";
import { BiCheckCircle } from "react-icons/bi";
import { Button } from "@/ui/components/Button";
import { Link } from "@/ui/router-events";

export default function CreateBot({ intro = true }: { intro?: boolean }) {
  const form = useForm();
  const introRef = useRef<HTMLDivElement>(null);
  const [createdBot, setCreatedBot] = useState<{
    id: string;
  }>();
  const [status, setSt, is] = useStatus();

  const handleSubmit = async (values: unknown) => {
    setCreatedBot(undefined);
    console.info("values on submit", values);
    const dataSafe = v.safeParse(CreateBotSchema, values);

    if (dataSafe.success) {
      const data = dataSafe.data;
      data.json_files;
      setSt("pending");
    } else {
      console.log(dataSafe.error.issues);
    }
    setSt("resolved");
  };
  return (
    <div className="w-full relative z-[1] overflow-hidden">
      <Formiz connect={form} onValidSubmit={handleSubmit} autoForm>
        {intro && <IntroStep form={form} ref={introRef} />}
        <UploadSwaggerStep form={form} />

        {!introRef ? (
          <Loading />
        ) : (
          <div>
            <Separator className="dark:bg-slate-700" />
            <Footer form={form} />
          </div>
        )}
      </Formiz>
      {is("pending") && (
        <div className="absolute animate-in fade-in inset-0 grid place-content-center z-[5] loading backdrop-blur-sm">
          <div>
            <Loading size={50} />
          </div>
        </div>
      )}
      {createdBot && is("resolved") && (
        <div className="absolute animate-in fade-in inset-0 grid place-content-center z-[5] loading backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center gap-2">
            <BiCheckCircle size={50} className="text-emerald-500" />
            <div>
              <Button
                variant={{
                  intent: "primary",
                  size: "sm",
                }}
                asChild
              >
                <Link href={`/app/bot/${createdBot?.id}`}>
                  OK,Let's view the bot
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
