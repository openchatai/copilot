import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { validateSwagger } from "@/data/copilot";
import { Link } from "@/lib/router-events";
import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useWizard } from "react-use-wizard";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import _ from "lodash";
import { useCreateCopilot } from "./CreateCopilotProvider";
import Loader from "@/components/ui/Loader";
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
    <li className="group/item relative list-none">
      <div className="flex items-center">
        <div className="absolute left-0 ml-2.5 h-full w-0.5 -translate-x-1/2 translate-y-3 self-start bg-slate-200 group-last-of-type/item:hidden dark:bg-slate-700" />

        <div className="absolute left-0 rounded-full">
          {success ? (
            <span className="flex-center rounded-full bg-indigo-500 p-0.5">
              <Check className="h-4 w-4 text-white" />
            </span>
          ) : (
            <span className="flex-center h-5 w-5 rounded-full bg-rose-500"></span>
          )}
        </div>

        <h3 className="pl-9 text-base font-bold text-slate-800 dark:text-slate-100">
          {label}
        </h3>
      </div>
      <div className="mb-3 pl-9 text-sm group-last-of-type/item:mb-0">
        {children}
      </div>
    </li>
  );
}

export function ValidateSwaggerStep() {
  const {
    state: { createdCopilot, validatorResponse },
    dispatch,
  } = useCreateCopilot();
  const { previousStep, nextStep } = useWizard();
  const [isLoading, setLoading] = useState(false);
  async function validate() {
    setLoading(true);
    if (createdCopilot && !validatorResponse) {
      const { data: validationsData } = await validateSwagger(
        createdCopilot.id,
      );
      if (validationsData) {
        dispatch({
          type: "SET_VALIDATIONS",
          payload: validationsData,
        });
      }
    }
    setLoading(false);
  }
  useEffect(() => {
    validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ep_missing_operation_id =
    validatorResponse?.validations.endpoints_without_operation_id;

  const ep_missing_name = validatorResponse?.validations.endpoints_without_name;

  const ep_missing_description =
    validatorResponse?.validations.endpoints_without_description;

  const all_eps = validatorResponse?.all_endpoints;
  const authorization = validatorResponse?.validations.auth_type;
  const there_are_errors =
    !_.isEmpty(ep_missing_operation_id) ||
    !_.isEmpty(ep_missing_name) ||
    !_.isEmpty(ep_missing_description);

  return (
    <div>
      <h2 className="mb-6 text-3xl font-bold text-accent-foreground">
        Validations & recommendations ✨
      </h2>
      <p>
        We will validate your Swagger file to make sure you will get the best
        results
      </p>
      {isLoading ? (
        <div className="flex-center mt-5 p-5">
          <Loader />
        </div>
      ) : (
        <>
          <div className="mt-5">
            {all_eps && all_eps.length > 0 ? (
              <ul>
                <>
                  {ep_missing_operation_id &&
                  ep_missing_operation_id.length > 0 ? (
                    <RmItem
                      label={
                        <>
                          Operation ID
                          <Badge className="ms-1.5 px-2" variant="destructive">
                            please fix
                          </Badge>
                        </>
                      }
                    >
                      Some of your endpoints does not have an operation ID. it's
                      required for the LLM to identify your endpoints.
                      <Link
                        className="block font-bold"
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
                                    <div className="text-left font-semibold">
                                      Path
                                    </div>
                                  </TableHead>
                                  <TableHead className="p-2">
                                    <div className="text-center font-semibold">
                                      Type
                                    </div>
                                  </TableHead>
                                  <TableHead className="p-2">
                                    <div className="text-center font-semibold">
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
                                      <div className="text-center">
                                        {ep.type}
                                      </div>
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
                          <Badge variant="success" className="ms-1.5 px-2">
                            great success
                          </Badge>
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
                  {ep_missing_description &&
                  ep_missing_description.length > 0 ? (
                    <RmItem
                      label={
                        <>
                          Names{" "}
                          <Badge variant="destructive" className="ms-1.5 px-2">
                            please fix
                          </Badge>
                        </>
                      }
                    >
                      Some of your endpoints does not have a description. it's
                      highly recommended to add a description to your endpoints
                      <Link
                        className="block font-bold"
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
                                    <div className="text-left font-semibold">
                                      Path
                                    </div>
                                  </TableHead>
                                  <TableHead className="p-2">
                                    <div className="text-center font-semibold">
                                      Type
                                    </div>
                                  </TableHead>
                                  <TableHead className="p-2">
                                    <div className="text-center font-semibold">
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
                                      <div className="text-center">
                                        {ep.type}
                                      </div>
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
                          <Badge variant="success" className="ms-1.5 px-2">
                            great success
                          </Badge>
                        </>
                      }
                      success
                    >
                      All your endpoints have a description. This is great for
                      the LLM to understand what your endpoints do.
                    </RmItem>
                  )}
                </>

                <>
                  {ep_missing_name && ep_missing_name.length > 0 ? (
                    <RmItem
                      label={
                        <>
                          Description
                          <Badge className="ms-1.5 px-2" variant="destructive">
                            please fix
                          </Badge>
                        </>
                      }
                    >
                      Some of your endpoints does not have a description. it's
                      highly recommended to add a description to your endpoints
                      <Link
                        className="block font-bold"
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
                                    <div className="text-left font-semibold">
                                      Path
                                    </div>
                                  </TableHead>
                                  <TableHead className="p-2">
                                    <div className="text-center font-semibold">
                                      Type
                                    </div>
                                  </TableHead>
                                  <TableHead className="p-2">
                                    <div className="text-center font-semibold">
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
                                      <div className="text-center">
                                        {ep.type}
                                      </div>
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
                          <Badge className="ms-1.5 px-2" variant="success">
                            great success
                          </Badge>
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
                          <Badge className="ms-1.5 px-2" variant="secondary">
                            recommendation
                          </Badge>
                        </>
                      }
                    >
                      You swagger file contain too many endpoints. we are still
                      not capable of parsing large swagger files, please pick
                      your most important endpoints and try it (we recommend
                      less than 15 endpoints)
                    </RmItem>
                  ) : (
                    <RmItem
                      label={
                        <>
                          Good number of endpoints
                          <Badge className="ms-1.5 px-2" variant="success">
                            great success
                          </Badge>
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
                          <Badge className="ms-1.5 px-2" variant="secondary">
                            recommendation
                          </Badge>
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
                          <Badge className="ms-1.5 px-2" variant="success">
                            great success
                          </Badge>
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
                    <Badge variant="destructive" className="ms-1.5 px-2">
                      please fix
                    </Badge>
                  </>
                }
              >
                the file contains 0 endpoints
              </RmItem>
            )}
          </div>
        </>
      )}

      <footer className="mt-5 flex w-full items-center justify-between gap-5 pt-5">
        <Button variant="ghost" onClick={previousStep} className="underline">
          Back
        </Button>
        {there_are_errors ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm">Next Step</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Make it better</AlertDialogTitle>
                <AlertDialogDescription>
                  Make sure that all recommendations are taken into
                  consideration. as it will help you to get the best out of the
                  platform.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogTrigger asChild onClick={nextStep}>
                  <Button size="sm" variant="destructive">
                    Yes, continue
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogCancel asChild>
                  <Button size="sm" variant="outline">
                    Let me fix it
                  </Button>
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button size="sm" onClick={nextStep}>
            Next Step
          </Button>
        )}
      </footer>
    </div>
  );
}
