"use client";
import Loading from "@/app/(main)/loading";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import { NavLink } from "@/components/ui/NavLink";
import { Button } from "@/components/ui/button";
import { getWorkflowsByBotId } from "@/data/flow";
import _ from "lodash";
import Link from "next/link";
import React from "react";
import useSwr from "swr";

export function WorkflowsList({ copilot_id }: { copilot_id: string }) {
  const flowsBase = `/copilot/${copilot_id}/flows`;
  const { data: flows, isLoading } = useSwr(
    copilot_id + "/workflows",
    async () => await getWorkflowsByBotId(copilot_id),
  );
  return isLoading ? (
    <Loading />
  ) : flows?.data.workflows && !_.isEmpty(flows.data.workflows) ? (
    <ul className="space-y-1 px-2">
      {_.map(flows.data.workflows, (workflow, i) => {
        const firstFlow = _.first(workflow.flows);
        return (
          <li key={i} className="h-fit w-full">
            <NavLink
              href={flowsBase + "/?workflow_id=" + workflow._id}
              className="flex items-center rounded border px-4 py-2 text-sm font-medium text-accent-foreground transition duration-150 ease-in-out "
              activeClassName="border-gray-300 bg-accent"
            >
              {firstFlow?.name}
            </NavLink>
          </li>
        );
      })}
    </ul>
  ) : (
    <div className="px-2">
      <EmptyBlock>
        <p className="text-center">
          <span>No workflows yet.</span>
          <Button variant="link" size="sm" asChild>
            <Link href={flowsBase}>create new one</Link>
          </Button>
        </p>
      </EmptyBlock>
    </div>
  );
}
