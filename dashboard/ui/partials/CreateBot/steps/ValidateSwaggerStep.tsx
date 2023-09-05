import Alert from "@/ui/components/Alert";
import Badge from "@/ui/components/Badge";
import Banner2 from "@/ui/components/Banner";
import { Button } from "@/ui/components/Button";
import { Heading } from "@/ui/components/Heading";
import Roadmap from "@/ui/components/Roadmap";
import { Form, FormizStep } from "@formiz/core";
import { Copilot, validateSwagger } from "api/copilots";
import { ComponentProps, ElementRef, forwardRef } from "react";
import useSWR from "swr";
export const ValidateSwaggerStep = forwardRef<
  ElementRef<"div">,
  ComponentProps<"div"> & { form: Form; createdBot?: Copilot }
>(({ form, createdBot, ...props }, _ref) => {
  console.log(createdBot);
  const { data: validatorResponse } = useSWR(
    createdBot ? [createdBot?.id] : null,
    validateSwagger,
    {
      revalidateOnMount: true,
      revalidateIfStale: true,
    }
  );
  console.log(validatorResponse);
  return (
    <FormizStep name="validate_swagger">
      <div>
        <Heading level={3} className="font-bold mb-6">
          Validations & recommendations ✨
        </Heading>
        <div>
          We will validate your Swagger file to make sure you will get the best
          results
        </div>
        <div className="mt-5">
          {validatorResponse?.data.all_endpoints.length !== 0 ? (
            <Roadmap
              items={[
                {
                  label: (
                    <>
                      Validating your swagger file
                      <Badge intent="success">great success</Badge>
                    </>
                  ),
                  description:
                    "All your endpoints have an operation ID. This is great for the LLM to identify your endpoints.",
                },
                {
                  label: (
                    <>
                      Description <Badge intent="success">great success</Badge>
                    </>
                  ),
                  description:
                    "All your endpoints have a description. This is great for the LLM to understand what your endpoints do. ",
                },
                {
                  label: (
                    <>
                      Names <Badge intent="success">great success</Badge>
                    </>
                  ),
                  description:
                    "All your endpoints have a description. This is great for the LLM to understand what your endpoints do. ",
                },
                {
                  label: (
                    <>
                      Good number of endpoints
                      <Badge intent="success">great success</Badge>
                    </>
                  ),
                  description:
                    "0 endpoints is a good number to start with. You can always add more later. ",
                },
                {
                  label: (
                    <>
                      Supported Authorization
                      <Badge intent="success">great success</Badge>
                    </>
                  ),
                  description:
                    "Your swagger file does not contain any authorization, you are goodto go. ",
                },
              ]}
            />
          ) : (
            <Banner2
              variant={{
                intent: "warning",
              }}
            >
              your Swagger file contains 0 endpoints
            </Banner2>
          )}
        </div>

        <footer className="w-full flex items-center justify-between gap-5 pt-5 border-t border-t-slate-400 mt-5">
          <Button
            variant={{ intent: "base" }}
            className="underline"
            onClick={() => form.prevStep()}
          >
            Back
          </Button>
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
            Make sure that all recommendations are taken into consideration. as
            it will help you to get the best out of the platform.
          </Alert>
        </footer>
      </div>
    </FormizStep>
  );
});

ValidateSwaggerStep.displayName = "PdfConfig";
