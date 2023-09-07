import { Button } from "@/ui/components/Button";
import { Heading } from "@/ui/components/Heading";
import { Form, FormizStep } from "@formiz/core";
import { Copilot } from "api/copilots";
import Link from "next/link";
import { ComponentProps, ElementRef, forwardRef } from "react";
import { BsCheck } from "react-icons/bs";
export const FinishStep = forwardRef<
  ElementRef<"div">,
  ComponentProps<"div"> & { form: Form; createdBot: Copilot | undefined }
>(({ form, createdBot, ...props }, _ref) => {
  return (
    <FormizStep name="finish_step">
      <div>
        <Heading
          level={3}
          className="font-bold mb-6 flex flex-col items-center justify-center gap-2"
        >
          <span className="inline-flex text-5xl fill-current rounded-full text-emerald-500 bg-emerald-100 p-2">
            <BsCheck />
          </span>
          Thats it! 🙌
        </Heading>
        <div className="mt-5 mx-auto w-fit">
          <Button
            asChild
            disabled={!createdBot?.id}
            variant={{
              intent: "primary",
            }}
          >
            <Link href={"/app/bot/" + createdBot?.id}>
              Open your copilot 🔥 {`->`}
            </Link>
          </Button>
        </div>
      </div>
    </FormizStep>
  );
});

FinishStep.displayName = "PdfConfig";
