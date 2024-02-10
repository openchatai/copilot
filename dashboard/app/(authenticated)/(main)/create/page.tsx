"use client";
import { Tooltip } from "@/components/domain/Tooltip";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RadioGroup,
  RadioGroupIndicator,
  RadioGroupPrimitiveItem,
} from "@/components/ui/radio-group";
import { Circle } from "lucide-react";
import React from "react";
import { cards } from "./data";
import { useCreateCopilot } from "./CreateCopilotProvider";
import { Link } from "@/lib/router-events";

export default function CreateCopilotIndexPage() {
  const { state, dispatch } = useCreateCopilot();
  return (
    <div className="flex-center size-full">
      <Card
        className="flex h-full max-h-[80%] w-full max-w-xl flex-col items-start *:w-full"
        hoverEffect={false}
      >
        <CardHeader className="border-b">
          <CardTitle>So, What do you want to create?</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto py-5">
          <RadioGroup
            value={state.selectedTemplate ?? undefined}
            onValueChange={(value) => {
              dispatch({ type: "SELECT_TEMPLATE", payload: value as any });
            }}
            className="grid grid-cols-2"
          >
            {cards.map((card, i) => (
              <RadioGroupPrimitiveItem
                key={i}
                className="flex-center flex aspect-[3/2] size-full flex-col items-start gap-1 rounded-lg p-3"
                value={card.type}
              >
                <div className="relative w-full flex-1 overflow-hidden rounded-lg border bg-accent">
                  <RadioGroupIndicator className="absolute right-2 top-2 text-accent-foreground">
                    <Circle className="size-4 fill-current" />
                  </RadioGroupIndicator>
                </div>
                <div className="flex w-full items-center justify-between px-1">
                  <Tooltip content={card.description} key={i}>
                    <h2 className="flex-1 text-start text-sm">{card.title}</h2>
                  </Tooltip>
                </div>
              </RadioGroupPrimitiveItem>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="border-t bg-secondary py-2">
          <Button className="ms-auto" asChild>
            <Link href="/create/setname">Next</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
