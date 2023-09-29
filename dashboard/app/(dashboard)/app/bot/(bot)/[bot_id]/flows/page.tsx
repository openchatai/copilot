"use client";
import React from "react";
import {
  CodePreview,
  Controller,
  FlowArena,
} from "@openchatai/copilot-flows-editor";
import "@openchatai/copilot-flows-editor/dist/style.css";
import { Button } from "@/ui/components/Button";
import { useBotData } from "@/ui/providers/BotDataProvider";

const flows = [
  {
    id: "1",
    name: "Add a pet",
    description:
      "Add a pet called luna and place order for her 3 days from now",
    steps: [],
    createdAt: Date.now(),
  },
];

// data-container="bot-layout"
// load the flows (set the initial state)
function Header() {
  const { bot } = useBotData();
  return (
    <div className="px-4 py-2 bg-white flex items-center justify-between w-full">
      <div className="flex items-center">
        <h1 className="text-lg font-bold">{bot?.name}</h1>
        <span className="mx-0.5 text-xl">/</span>
        <h2 className="text-sm text-gray-500 font-semibold"></h2>
      </div>
      <Button variant={{ intent: "primary", size: "sm" }}>Save</Button>
    </div>
  );
}

export default function FlowsPage() {
  return (
    <>
      <style jsx global>{`
        [data-container="bot-layout"] {
          padding: 0 !important;
        }
      `}</style>
      <Controller
        onChange={(data) => console.log(data)}
        initialState={{
          paths: [
            {
              path: "/flow-1",
              methods: [
                {
                  method: "get",
                  description: "This is a get method",
                  operationId: "get-flow-1",
                  summary: "Get flow 1",
                  tags: ["flow-1"],
                },
                {
                  method: "post",
                  description: "This is a get method",
                  operationId: "get-flow-1",
                  summary: "Get flow 1",
                  tags: ["flow-1"],
                },
              ],
            },
          ],
          flows: flows,
        }}
      >
        <div className="h-full absolute inset-0 overflow-hidden flex flex-col items-start">
          <Header />
          <div className="w-full h-full flex items-start justify-between relative flex-1">
            <FlowArena />
            <CodePreview />
          </div>
        </div>
      </Controller>
    </>
  );
}
