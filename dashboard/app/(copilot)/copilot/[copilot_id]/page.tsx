"use client";
import CodeBlock from "@/components/domain/CodeBlock";
import { HeaderShell } from "@/components/domain/HeaderShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Wand2, Inspect, Search } from "lucide-react";
import { Link } from "@/lib/router-events";
import React from "react";
import { useCopilot } from "../_context/CopilotProvider";
import dynamic from "next/dynamic";
import { useSearchModal } from "@/app/_store/searchModal";

const Widget = dynamic(() => import("./CopilotWidget"));

function InstallationSection() {
  const { token: CopilotToken } = useCopilot();
  const baseUrl = "http://localhost:8888"  // @todo read from the env
  return (
    <section className="rounded-lg border bg-white shadow-sm">
      <AccordionItem value="installation">
        <AccordionTrigger>
          <div className="flex flex-row items-center gap-3">
            <span className="flex-center h-9 w-9 rounded-lg bg-secondary text-primary">
              <Wand2 className="h-4 w-4" />
            </span>
            <div className="text-start">
              <h1 className="text-base font-semibold">Simple install</h1>
              <p className="text-sm font-normal">
                You can use the pre-bundled widget by adding the script to your
                website
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-8 py-6">
          <p className="mb-2 font-medium">
            Paste this code snippet before the closing <strong> {`</body>`}</strong> tag on all pages you want the widget to
            appear. <a href="https://docs.opencopilot.so/widget/embed">Read more</a>
          </p>
          <CodeBlock
            code={`
<script src="${baseUrl}/pilot.js"></script>
<script> 
      const options = {
        apiUrl: "${baseUrl}/backend", 
        initialMessages: ["How are the things"],
        token: "${CopilotToken}", 
        triggerSelector: "#triggerSelector", 
        headers: { 
          // optional: you can pass your authentication tokens to the copilot or any other header you want to send with every request
          Authorization: "Bearer your_auth_token_goes_here",
          AnyKey: "AnyValue"
        },
        user:{
          name:"Default User"
        }
      }
      window.addEventListener("DOMContentLoaded", ()=>initAiCoPilot(options));
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
              <h1 className="text-base font-semibold">Via a package manager</h1>
              <p className="text-sm font-normal">
                Most common options are available
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-8 py-6">
          <p className="mb-2">
            <Button asChild variant="link" className="p-0">
              <Link
                target="_blank"
                href={"https://docs.opencopilot.so/widget/embed#as-a-react-component"}
              >
                You can get started by visiting the copilot embed guide
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
  const [, setSearch] = useSearchModal()
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <HeaderShell className="justify-between bg-white">
        <h1 className="text-lg font-bold text-accent-foreground">
          {CopilotName}
        </h1>
        <div className="space-x-2 flex items-center">
          <Button variant='ghost' onClick={() => setSearch(true)} size='fit'>
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </HeaderShell>
      <div className="flex-1 flex flex-row justify-between overflow-hidden">
        <div className="flex-1 max-w-screen-lg p-8 max-h-full overflow-auto">
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
        <div className="h-full w-full p-4 max-w-sm xl:max-w-md">
          <Widget token={CopilotToken} />
        </div>
      </div>
    </div>
  );
}
