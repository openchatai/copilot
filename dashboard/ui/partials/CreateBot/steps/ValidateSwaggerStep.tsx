import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/ui/components/AccordionAlt";
import Alert from "@/ui/components/Alert";
import Badge from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { Heading } from "@/ui/components/Heading";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/components/table/Table";
import { Form, FormizStep } from "@formiz/core";
import { Copilot, validateSwagger } from "api/copilots";
import Link from "next/link";
import { ComponentProps, ElementRef, forwardRef } from "react";
import { BsCheck } from "react-icons/bs";
import useSWR from "swr";

function RmItem({
  label,
  children,
  success,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  success?: boolean;
}) {
  return (
    <li className="relative group/item">
      <div className="flex items-center">
        <div className="absolute dark:bg-slate-700 left-0 h-full group-last-of-type/item:hidden w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3" />

        <div className="absolute left-0 rounded-full">
          {success ? (
            <span className="flex-center w-5 h-5 rounded-full bg-indigo-500">
              <BsCheck className="text-white fill-current" />
            </span>
          ) : (
            <span className="flex-center w-5 h-5 rounded-full bg-rose-500"></span>
          )}
        </div>

        <h3 className="text-base font-bold text-slate-800 pl-9 dark:text-slate-100">
          {label}
        </h3>
      </div>
      <div className="pl-9 mb-3 group-last-of-type/item:mb-0 text-sm">
        {children}
      </div>
    </li>
  );
}

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
  const ep_missing_operation_id =
    validatorResponse?.data.validations.endpoints_without_operation_id;

  const ep_missing_name =
    validatorResponse?.data.validations.endpoints_without_name;

  const ep_missing_description =
    validatorResponse?.data.validations.endpoints_without_description;

  const all_eps = validatorResponse?.data.all_endpoints;
  const authorization = validatorResponse?.data.validations.auth_type;
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
        <div className="mt-5 [&_.badge]:ms-1">
          {all_eps && all_eps.length > 0 ? (
            <ul>
              <>
                {ep_missing_operation_id &&
                ep_missing_operation_id.length > 0 ? (
                  <RmItem
                    label={
                      <>
                        Operation ID <Badge intent="danger">please fix</Badge>
                      </>
                    }
                  >
                    Some of your endpoints does not have an operation ID. it's
                    required for the LLM to identify your endpoints.
                    <Link
                      className="font-bold block"
                      href="https://swagger.io/docs/specification/paths-and-operations/"
                    >
                      Learn how to fix? {`->`}
                    </Link>
                    <Accordion type="multiple" className="mt-2">
                      <AccordionItem value="eps">
                        <AccordionTrigger>
                          see which endpoints to fix
                        </AccordionTrigger>
                        <AccordionContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="p-2">
                                  <div className="font-semibold text-left">
                                    Path
                                  </div>
                                </TableHead>
                                <TableHead className="p-2">
                                  <div className="font-semibold text-center">
                                    Type
                                  </div>
                                </TableHead>
                                <TableHead className="p-2">
                                  <div className="font-semibold text-center">
                                    Operation Id
                                  </div>
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ep_missing_operation_id.map((ep) => (
                                <TableRow key={ep.path}>
                                  <TableHead className="p-2">
                                    <div className="text-left">{ep.path}</div>
                                  </TableHead>
                                  <TableHead className="p-2">
                                    <div className="text-center">{ep.type}</div>
                                  </TableHead>
                                  <TableHead className="p-2">
                                    <div className="text-center">
                                      {ep.operationId}
                                    </div>
                                  </TableHead>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </RmItem>
                ) : (
                  <RmItem
                    label={
                      <>
                        Validating your swagger file{" "}
                        <Badge intent="success">great success</Badge>
                      </>
                    }
                    success
                  >
                    All your endpoints have an operation ID. This is great for
                    the LLM to identify your endpoints.
                  </RmItem>
                )}
              </>

              <>
                {ep_missing_description && ep_missing_description.length > 0 ? (
                  <RmItem
                    label={
                      <>
                        Names <Badge intent="danger">please fix</Badge>
                      </>
                    }
                  >
                    Some of your endpoints does not have a description. it's
                    highly recommended to add a description to your endpoints
                    <Link
                      className="font-bold block"
                      href="https://swagger.io/docs/specification/paths-and-operations/"
                    >
                      Learn how to fix? {`->`}
                    </Link>
                    <Accordion type="multiple" className="mt-2">
                      <AccordionItem value="eps">
                        <AccordionTrigger>
                          see which endpoints to fix
                        </AccordionTrigger>
                        <AccordionContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="p-2">
                                  <div className="font-semibold text-left">
                                    Path
                                  </div>
                                </TableHead>
                                <TableHead className="p-2">
                                  <div className="font-semibold text-center">
                                    Type
                                  </div>
                                </TableHead>
                                <TableHead className="p-2">
                                  <div className="font-semibold text-center">
                                    Operation Id
                                  </div>
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ep_missing_description.map((ep) => (
                                <TableRow key={ep.path}>
                                  <TableHead className="p-2">
                                    <div className="text-left">{ep.path}</div>
                                  </TableHead>
                                  <TableHead className="p-2">
                                    <div className="text-center">{ep.type}</div>
                                  </TableHead>
                                  <TableHead className="p-2">
                                    <div className="text-center">
                                      {ep.operationId}
                                    </div>
                                  </TableHead>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </RmItem>
                ) : (
                  <RmItem
                    label={
                      <>
                        Description
                        <Badge intent="success">great success</Badge>
                      </>
                    }
                    success
                  >
                    All your endpoints have a description. This is great for the
                    LLM to understand what your endpoints do.
                  </RmItem>
                )}
              </>

              <>
                {ep_missing_name && ep_missing_name.length > 0 ? (
                  <RmItem
                    label={
                      <>
                        Description <Badge intent="danger">please fix</Badge>
                      </>
                    }
                  >
                    Some of your endpoints does not have a description. it's
                    highly recommended to add a description to your endpoints
                    <Link
                      className="font-bold block"
                      href="https://swagger.io/docs/specification/paths-and-operations/"
                    >
                      Learn how to fix? {`->`}
                    </Link>
                    <Accordion type="multiple" className="mt-2">
                      <AccordionItem value="eps">
                        <AccordionTrigger>
                          see which endpoints to fix
                        </AccordionTrigger>
                        <AccordionContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="p-2">
                                  <div className="font-semibold text-left">
                                    Path
                                  </div>
                                </TableHead>
                                <TableHead className="p-2">
                                  <div className="font-semibold text-center">
                                    Type
                                  </div>
                                </TableHead>
                                <TableHead className="p-2">
                                  <div className="font-semibold text-center">
                                    Operation Id
                                  </div>
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ep_missing_name.map((ep) => (
                                <TableRow key={ep.path}>
                                  <TableHead className="p-2">
                                    <div className="text-left">{ep.path}</div>
                                  </TableHead>
                                  <TableHead className="p-2">
                                    <div className="text-center">{ep.type}</div>
                                  </TableHead>
                                  <TableHead className="p-2">
                                    <div className="text-center">
                                      {ep.operationId}
                                    </div>
                                  </TableHead>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </RmItem>
                ) : (
                  <RmItem
                    label={
                      <>
                        Validating your swagger file
                        <Badge intent="success">great success</Badge>
                      </>
                    }
                    success
                  >
                    All your endpoints have an operation ID. This is great for
                    the LLM to identify your endpoints.
                  </RmItem>
                )}
              </>

              <>
                {all_eps && all_eps.length > 15 ? (
                  <RmItem
                    label={
                      <>
                        Too many endpoints
                        <Badge intent="info">recommendation</Badge>
                      </>
                    }
                  >
                    You swagger file contain too many endpoints. we are still
                    not capable of parsing large swagger files, please pick your
                    most important endpoints and try it (we recommend less than
                    15 endpoints)
                  </RmItem>
                ) : (
                  <RmItem
                    label={
                      <>
                        Good number of endpoints
                        <Badge intent="success">great success</Badge>
                      </>
                    }
                    success
                  >
                    {all_eps.length} endpoints is a good number to start with.
                    You can always add more later.
                  </RmItem>
                )}
              </>

              <>
                {authorization ? (
                  <RmItem
                    label={
                      <>
                        {authorization}
                        <Badge intent="info">recommendation</Badge>
                      </>
                    }
                  >
                    Your swagger file contains {authorization} authorization.
                    Our system is still in early beta and might struggle with
                    {authorization} authorization. but let's give it a try.
                  </RmItem>
                ) : (
                  <RmItem
                    label={
                      <>
                        Supported Authorization
                        <Badge intent="success">great success</Badge>
                      </>
                    }
                    success
                  >
                    Your swagger file does not contain any authorization, you
                    are goodto go.
                  </RmItem>
                )}
              </>
            </ul>
          ) : (
            <RmItem
              label={
                <>
                  No endpoints
                  <Badge intent="danger">please fix</Badge>
                </>
              }
            >
              the file contains 0 endpoints
            </RmItem>
          )}
        </div>

        <footer className="w-full flex items-center justify-between gap-5 pt-5 mt-5">
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
