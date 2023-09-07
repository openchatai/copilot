"use client";
import React, { useEffect, useState } from "react";
import { Textarea } from "@/ui/components/TextArea";
import { Button } from "../components/Button";
import { useField } from "@formiz/core";

const data = [
  {
    label: "General Copilot 🤖",
    context: `You are a helpful AI co-pilot.Your job is to support and help the user.Sometimes you might need to call some API endpoints to get the data you need to answer the user's question.You will be given a context and a question; you need to answer the question based on the context.`,
  },
  {
    label: "SAAS Copilot 🏢",
    context: `You are an AI e-commerce assistant, here to assist and guide the user through their online commerce journey.Occasionally, you might interact with various API endpoints to fetch information needed to address the user's inquiries.You know a lot about e-commerce and online shopping, and you're here to help the user run their online business smoothly.You'll receive a situation and a query, and your task is to respond to the question using the given scenario.`,
  },
  {
    label: "SAAS Accounting",
    context: `You are an AI accounting assistant, ready to help users manage their financial tasks and responsibilities.At times, you might access specific accounting software or databases to gather relevant information.Your expertise lies in financial matters, and you're here to provide assistance with accounting-related queries.You'll be provided with a context and a question, and your goal is to answer the question based on the provided information.`,
  },
  {
    label: "Marketing 👛",
    context: `You are an AI marketing assistant, geared towards helping users excel in their marketing efforts.You have the capability to interact with marketing-related APIs to gather relevant data that addresses the user's inquiries.With a solid understanding of marketing strategies and trends, you're here to assist users in achieving their marketing objectives.When presented with a situation and a question, your task is to formulate a response based on the given context.`,
  },
  {
    label: "Critical thinker 🤔",
    context: `You are an AI critical thinker. Use the following pieces of context to analyze and provide a thoughtful response to the question.If the question doesn't align with the context, respond by acknowledging the question but indicating that it's not within the purview of critical thinking.{context} Question: {question} Thoughtful response in markdown:`,
  },
];

function ChangeBotContext({
  onChange,
  defaultContext,
  name,
}: {
  onChange?: (context: string) => void;
  defaultContext: string;
  name: string;
}) {
  const [context, setContext] = useState<string>(defaultContext);
  const { value, setValue } = useField({ name, defaultValue: defaultContext });
  useEffect(() => {
    onChange?.(context);
    setValue(context);
  }, [context, onChange, setValue]);
  return (
    <div className="mt-5 grid w-full lg:grid-cols-6 grid-cols-1 gap-4">
      <div className="lg:col-span-3">
        <Textarea
          minRows={5}
          defaultValue={context}
          maxRows={8}
          required
          aria-required
          value={context}
          onChange={(e) => {
            setContext(e.target.value);
          }}
        />
      </div>
      <div className="flex flex-col items-center justify-center lg:col-span-1">
        <span>✨or ✨</span>
      </div>
      <div className="flex flex-wrap items-center justify-start h-fit gap-1 lg:col-span-2">
        <Button
          onClick={() => {
            setContext(defaultContext);
          }}
          variant={{ intent: "secondary" }}
        >
          default
        </Button>
        {data.map((item, index) => (
          <Button
            key={index}
            onClick={() => {
              setContext(item.context);
            }}
            variant={{ intent: "secondary" }}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default ChangeBotContext;
