"use client";
import { Button } from "@/ui/components/Button";
import CodeBlock from "@/ui/components/CodeBlock";
import { Link } from "@/ui/router-events";
import React from "react";
import { BsExclamationTriangle } from "react-icons/bs";
export default function ErrorComponent({
  reset,
  error,
}: {
  reset: () => void;
  error: any;
}) {
  console.log(error);
  return (
    <div className="w-full grid place-content-center h-full container">
      <div className="p-5 flex items-center justify-center flex-col gap-2">
        <div>
          <BsExclamationTriangle size={50} className="text-rose-500" />
        </div>
        <div className="max-w-xl w-full">
          <CodeBlock language="shell" code={JSON.stringify(error.message)} />
        </div>
        <div>
          Error Occurred - Please {" "}
          <a className="underline font-semibold" href="https://github.com/openchatai/OpenCopilot/issues/new">
            open a GitHub issue
          </a>{" "}
          and we will make sure your problem get solved
        </div>
        <div className="space-x-2">
          <Button
            variant={{
              intent: "danger",
              size: "xs",
            }}
            onClick={reset}
          >
            Reset
          </Button>
          <Button
            variant={{
              intent: "secondary",
              size: "xs",
            }}
            asChild
          >
            <Link href="/app">Index</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
