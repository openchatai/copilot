"use client";
import { NavLink } from "@/components/ui/NavLink";
import _ from "lodash";
import useSWR, { mutate } from "swr";

export function mutateFlows(copilot_id: string) {
  mutate('flows/' + copilot_id)
}

export function WorkflowsList({ copilot_id }: { copilot_id: string }) {
  const { data: flows, isLoading } = useSWR('flows/' + copilot_id);
  const flowsBase = `/copilot/${copilot_id}/flows`;

  return (
  <ul className="px-2 space-y-2">
    <li>
      <NavLink
        href={flowsBase + "/?workflow_id=" + "first_flow"}
        matchSearchParams
        className="flex items-center rounded border px-4 py-2 text-sm font-medium text-accent-foreground transition duration-150 ease-in-out "
        activeClassName="border-gray-300 bg-accent"
      >
        First flow
      </NavLink>
    </li>
  </ul>
  )
}
