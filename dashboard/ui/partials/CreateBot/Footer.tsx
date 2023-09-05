import Alert from "@/ui/components/Alert";
import { Button } from "@/ui/components/Button";
import { Form } from "@formiz/core";
import React from "react";
import { BsArrowRightShort } from "react-icons/bs";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
export function Footer({ form }: { form: Form }) {
  return (
    <footer
      className={
        "w-full flex items-center justify-between gap-5 pt-5 pb-0 max-w-full border-t border-t-slate-800"
      }
    >

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
      {form.currentStep?.index === 2 && (
        <Alert
          title="To make it better"
          type="danger"
          action={
            <Button
              variant={{ intent: "danger", size: "sm" }}
              onClick={form.nextStep}
            >
              Yes, continue
            </Button>
          }
          cancel={<Button variant={{ size: "sm" }}>Let me fix it</Button>}
          trigger={
            <Button
              variant={{ intent: "primary" }}
              className="flex-center gap-1"
            >
              Next
              {`->`}
            </Button>
          }
        >
          Make sure that all recommendations are taken into consideration. as it
          will help you to get the best out of the platform.
        </Alert>
      )}
      {!form.isFirstStep &&
        !form.isLastStep &&
        !(form.currentStep?.index === 2) && (
          <Button
            disabled={!form.isStepValid}
            variant={{ intent: "primary" }}
            className="flex-center gap-1"
            onClick={() => form.submitStep()}
          >
            Next Step
            {`->`}
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
