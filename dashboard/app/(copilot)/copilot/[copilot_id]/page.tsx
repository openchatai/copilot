"use client";
import CodeBlock from "@/components/domain/CodeBlock";
import { HeaderShell } from "@/components/domain/HeaderShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Wand2, Inspect } from "lucide-react";
import { Link } from "@/lib/router-events";
import React from "react";
import { useCopilot } from "../_context/CopilotProvider";
import dynamic from "next/dynamic";

const Widget = dynamic(() => import("./CopilotWidget"));

function InstallationSection() {
  const { token: CopilotToken } = useCopilot();

  return (
    <section className="rounded-lg border bg-white shadow-sm">
      <AccordionItem value="installation">
        <AccordionTrigger>
          <div className="flex flex-row items-center gap-3">
            <span className="flex-center h-9 w-9 rounded-lg bg-secondary text-primary">
              <Wand2 className="h-4 w-4" />
            </span>
            <div className="text-start">
              <h1 className="text-base font-semibold">Pre-Bundled</h1>
              <p className="text-sm font-normal">
                You can use the pre-bundled widget by adding the script to your
                website
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-8 py-6">
          <p className="mb-2 font-medium">
            Paste this code snippet before the closing
            <strong>{`</body>`}</strong> tag on all pages you want the widget to
            appear. Remember to version to run your Assistant.
          </p>
          <CodeBlock
            code={`
            <script src="http://${baseUrl}/pilot.js"></script>
            <script> // be aware to call this function when the document/window is ready.
            const options = {
              apiUrl: "http://${baseUrl}/backend", // your base url where your are hosting OpenCopilot at (the API), usually it's http://localhost:5000/api
              initialMessages: ["How are the things"], // optional: you can pass an array of messages that will be sent to the copilot when it's initialized
              token: "${CopilotToken}", // you can get your token from the dashboard
              triggerSelector: "#triggerSelector", // the selector of the element that will trigger the copilot when clicked
              headers: { 
                // optional: you can pass your authentication tokens to the copilot or any other header you want to send with every request
                Authorization: "Bearer your_auth_token_goes_here",
                AnyKey: "AnyValue"
              },
              user:{
                name:"Default User"
              }
            }
            window.addEventListener("DOMContentLoaded", ()=>initAiCoPilot(options)); // window.onload
</script>
`}
          />
        </AccordionContent>
      </AccordionItem>
    </section>
  );
}

function SelfHost() {

  return (
    <section className="rounded-lg border bg-white shadow-sm">
      <AccordionItem value="try-share">
        <AccordionTrigger>
          <div className="flex flex-row items-center gap-3">
            <span className="flex-center h-9 w-9 rounded-lg bg-secondary text-primary">
              <Inspect className="h-4 w-4" />
            </span>
            <div className="text-start">
              <h1 className="text-base font-semibold">Self host the widget</h1>
              <p className="text-sm font-normal">
                You can self host the widget by installing it from npm
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-8 py-6">
          <p className="mb-2">
            You can follow this guide to self host the React Component
            <Button asChild variant="link" className="p-0">
              <Link
                target="_blank"
                href={"https://docs.opencopilot.so/widget/embed#as-a-react-component"}
              >
                The Docs
              </Link>
            </Button>
            .
          </p>
        </AccordionContent>
      </AccordionItem>
    </section>
  );
}

export default function CopilotPage() {
  const { name: CopilotName, token: CopilotToken } = useCopilot();
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <HeaderShell className="justify-between bg-white">
        <h1 className="text-lg font-bold text-accent-foreground">
          {CopilotName}
        </h1>
        <div className="space-x-2">
          <Button
            id="triggerSelector"
          >
            Chat with the Copilot
          </Button>
        </div>
      </HeaderShell>
      <div className="flex-1 flex flex-row justify-between overflow-hidden">
        <div className="flex-1 max-w-screen-lg p-8 max-h-full overflow-auto">
          <Alert variant="info" className="mb-5">
            <ShieldAlert className="h-6 w-6" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
              If your APIs requires authorization then you might need to provide
              the needed headers to enable OpenCopilot from accessing it
            </AlertDescription>
          </Alert>
          <h2 className="text-xl font-semibold mb-5">Installation</h2>
          <Accordion
            type="single"
            className="max-w-full space-y-5"
            defaultValue="installation"
          >
            <InstallationSection />
            <SelfHost />
          </Accordion>
        </div>
        <div className="h-full w-fit py-5 px-10">
          <Widget token={CopilotToken} />
        </div>
      </div>
    </div>
  );
}
