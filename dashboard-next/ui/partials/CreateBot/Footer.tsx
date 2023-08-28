import { Button } from "@/ui/components/Button";
import { Form } from "@formiz/core";
import React from "react";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
export function Footer({ form }: { form: Form }) {
  return (
    <footer
      className={
        "w-full flex items-center justify-between gap-5 pt-5 pb-0 mt-4 max-w-full"
      }
    >
      {form.isFirstStep && (
        <Button
          variant={{ intent: "primary", width: "fluid" }}
          className="mx-2 flex-center gap-1"
          disabled={!form.steps?.at(0)?.isValid}
          onClick={() => form.submitStep()}
        >
          OK,let's do it!
        </Button>
      )}

      {!form.isFirstStep && (
        <Button
          variant={{ intent: "secondary" }}
          className="flex items-center justify-center gap-1"
          onClick={() => form.prevStep()}
        >
          <FaLongArrowAltLeft />
          <span>back</span>
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
