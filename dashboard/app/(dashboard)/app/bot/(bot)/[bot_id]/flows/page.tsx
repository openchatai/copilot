"use client";
import React from "react";
import {
  CodePreview,
  Controller,
  FlowArena,
} from "@openchatai/copilot-flows-editor";
import "@openchatai/copilot-flows-editor/dist/style.css";
type Props = {};
// data-container="bot-layout"
export default function FlowsPage({}: Props) {
  return (
    <>
      <style jsx global>{`
        [data-container="bot-layout"] {
          padding: 0 !important;
        }
      `}</style>
      <div className="h-full block absolute inset-0 overflow-hidden">
        <div className="w-full h-full flex items-start justify-between relative">
          <Controller
            initilState={{
              paths: [],
              flows: [],
            }}
          >
            <FlowArena />
            <CodePreview />
          </Controller>
        </div>
      </div>
    </>
  );
}
