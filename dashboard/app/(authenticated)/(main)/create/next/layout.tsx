"use client";
import React from "react";
import { useCreateCopilot } from "../CreateCopilotProvider";

type Props = {
  copilot: React.ReactNode;
  someothertype: React.ReactNode;
};

export default function CreateCopilotNextStep({
  copilot,
  someothertype,
}: Props) {
  const { state } = useCreateCopilot();
  if (state.selectedTemplate === "copilot") {
    return <div>{copilot}</div>;
  }
  return <div>{someothertype}</div>;
}
