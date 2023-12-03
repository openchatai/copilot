"use client";
import { NavLink } from "@/components/ui/NavLink";
import _ from "lodash";

export function WorkflowsList({ copilot_id }: { copilot_id: string }) {
  const flowsBase = `/copilot/${copilot_id}/flows`;
  return <ul className="px-2 space-y-2">
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
}
