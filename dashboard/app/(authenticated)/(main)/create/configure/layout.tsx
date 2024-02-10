"use client";
import React from "react";
import { useCreateCopilot } from "../CreateCopilotProvider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  copilot: React.ReactNode;
  someothertype: React.ReactNode;
};

export default function CreateCopilotNextStep({
  copilot,
  someothertype,
}: Props) {
  const { state, dispatch } = useCreateCopilot();
  console.log(state.selectedTemplate);
  return (
    <div className="flex-center size-full">
      <Card
        className="flex max-h-[80%] min-h-fit w-full max-w-xl flex-col items-start *:w-full"
        hoverEffect={false}
      >
        <CardHeader className="border-b">
          <CardTitle>Let's configure your project 🤖</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto py-5">
          {state.selectedTemplate === "copilot" && copilot}
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t bg-secondary py-2">
          <Button variant="secondary" asChild>
            <Link href="/create/setname">Back</Link>
          </Button>
          <Button asChild>
            <Link href="/create/finish">Finish</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
