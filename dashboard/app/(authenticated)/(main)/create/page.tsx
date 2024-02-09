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

const cards = [
  {
    type: "copilot",
    title: "Copilot",
    description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    type: "search",
    title: "Search",
    description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    type: "chat",
    title: "Chat",
    description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

export default function page() {
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
          <RadioGroup className="grid grid-cols-2">
            {cards.map((card, i) => (
              <RadioGroupPrimitiveItem
                key={i}
                className="flex-center flex aspect-[3/2] size-full flex-col items-start gap-1 rounded-lg p-3"
                value={card.type}
              >
                <div className="relative w-full flex-1 rounded-lg border bg-accent">
                  <RadioGroupIndicator className="absolute right-2 top-2 text-accent-foreground">
                    <Circle className="size-4 fill-current" />
                  </RadioGroupIndicator>
                </div>
                <div className="flex w-full items-center justify-between px-1">
                  <Tooltip content={card.description} key={i}>
                    <h2 className="text-sm flex-1 text-start">{card.title}</h2>
                  </Tooltip>
                </div>
              </RadioGroupPrimitiveItem>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="border-t bg-secondary py-2">
          <Button className="ms-auto">Next</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
