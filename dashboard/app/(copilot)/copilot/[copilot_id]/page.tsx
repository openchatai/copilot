import CodeBlock from "@/components/domain/CodeBlock";
import { HeaderShell } from "@/components/domain/HeaderShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Wand2 } from "lucide-react";
import React from "react";

function InstallationSection() {
  return (
    <section className="rounded-lg border bg-white shadow-sm">
      <AccordionItem value="installation">
        <AccordionTrigger className="">
          <div className="flex flex-row items-center gap-3">
            <span className="flex-center h-9 w-9 rounded-lg bg-secondary text-secondary-foreground">
              <Wand2 className="h-4 w-4" />
            </span>
            <div className="text-start">
              <h1 className="text-base font-semibold">Installation</h1>
              <p className="text-sm font-normal">
                Add the installation code to your website
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-8 py-6">
          <p className="mb-2">
            Paste this code snippet before the closing {`</body>`} tag on all
            pages you want the widget to appear. Remember to version to run your
            Assistant.
          </p>
          <CodeBlock
            code={`<script>
  // be aware to call this function when the document/window is ready.

  const options = {
     apiUrl: "https://yourdomain.com/api" // your base url where your are hosting OpenCopilot at (the API), usually it's http://localhost:5000/api
     initialMessages: ["How are the things"], // optional: you can pass an array of messages that will be sent to the copilot when it's initialized
     token: "your_copilot_token_goes_here", // you can get your token from the dashboard
     triggerSelector: "#triggerSelector", // the selector of the element that will trigger the copilot when clicked
     headers: {
       // optional: you can pass your authentication tokens to the copilot or any other header you want to send with every request
       Authorization: "Bearer your_auth_token_goes_here",
       AnyKey: "AnyValue"
     },
   }
   window.addEventListener("DOMContentLoaded", ()=>initAiCoPilot(options)); // window.onload
</script>`}
          />
        </AccordionContent>
      </AccordionItem>
    </section>
  );
}

export default async function CopilotPage() {
  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
      <HeaderShell className="bg-white">
        <h1 className="text-lg font-bold text-accent-foreground">
          Copilot's Name
        </h1>
      </HeaderShell>
      <div className="flex-1 overflow-auto">
        <div className="container max-w-screen-md p-8">
          <Alert variant='info' className="mb-5">
            <ShieldAlert className="h-6 w-6" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
            If your APIs requires authorization then you might need to provide the needed headers to enable OpenCopilot from accessing it
            </AlertDescription>
          </Alert>
          <Accordion type="multiple" className="max-w-full">
            <InstallationSection />
          </Accordion>
        </div>
      </div>
    </div>
  );
}
