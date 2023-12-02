"use client";
import _ from "lodash";
import React from "react";
import { useController } from "@/components/domain/flows-editor";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { getWorkflowsByBotId } from "@/data/flow";

export function WorkflowsList({ copilot_id }: { copilot_id: string }) {
  const flowsBase = `/copilot/${copilot_id}/flows`;
  const {
    state: { flows, activeFlowId },
    setActiveFlow,
    loadData
  } = useController();
  const { isLoading } = useSWR('flows/' + copilot_id, () => getWorkflowsByBotId(copilot_id), {
    onSuccess: ({ data }) => {
      const firstFlow = _.first(data.workflows)
      if (firstFlow) {
        loadData(firstFlow)
      }
    }
  })
  return <ul className="space-y-1 px-2">
    {
      flows.map((flow, i) => {
        const isActive = flow.id === activeFlowId
        return <li key={i}>
          <button onClick={() => setActiveFlow(flow.id)} className={cn("w-full font-medium flex items-center rounded border px-4 py-2 text-sm text-accent-foreground transition duration-150 ease-in-out", isActive && "border-gray-300 bg-accent border-primary font-semibold ")}>
            {flow.name}
          </button>
        </li>
      })
    }
  </ul>
}
