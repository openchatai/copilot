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
import { Copilot, createCopilot } from "api/copilots";

export default function CreateBot({ intro = true }: { intro?: boolean }) {
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
      const res = createCopilot({
        swagger_file: data.json_files[0],
      })
        .then((response) => {
          console.log(response);
          setCreatedBot(response.data.chatbot);
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
    <div className="w-full z-[1] overflow-hidden">
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
