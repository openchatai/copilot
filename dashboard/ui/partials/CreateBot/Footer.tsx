import { Button } from "@/ui/components/Button";
import { Form } from "@formiz/core";
import React from "react";
import { BsArrowRightShort } from "react-icons/bs";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
export function Footer({ form }: { form: Form }) {
  return (
    <footer
      className={
        "w-full flex items-center justify-between gap-5 pt-5 pb-0 max-w-full"
      }
    >
      {form.isFirstStep && (
        <Button
          variant={{ intent: "primary" }}
          className="flex-center gap-1 justify-self-end"
          disabled={!form.steps?.at(0)?.isValid}
          onClick={() => form.submitStep()}
        >
          <span>OK,let's do it!</span>
          <BsArrowRightShort />
        </Button>
      )}

      {!form.isFirstStep && (
        <Button
          variant={{ intent: "base" }}
          className="flex items-center justify-center gap-1 underline"
          onClick={() => form.prevStep()}
        >
          <FaLongArrowAltLeft />
          <span>Back</span>
        </Button>
      )}

      {!form.isFirstStep && !form.isLastStep && (
        <Button
          disabled={!form.isStepValid}
          variant={{ intent: "primary" }}
          className="flex-center gap-1"
          onClick={() => form.submitStep()}
        >
          <span>Continue</span>
          <FaLongArrowAltRight />
        </Button>
      )}

      {form.isLastStep && form.isValid && (
        <Button
          variant={{ intent: "primary" }}
          onClick={() => form.submitStep()}
        >
          <span>Create</span>
          <FaLongArrowAltRight />
        </Button>
      )}
    </footer>
  );
}
