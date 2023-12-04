"use client";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import Loader from "@/components/ui/Loader";
import { NavLink } from "@/components/ui/NavLink";
import { getWorkflowsByBotId } from "@/data/flow";
import _ from "lodash";
import useSWR, { mutate } from "swr";

export function mutateFlows(copilot_id: string) {
  mutate('flows/' + copilot_id)
}

export function WorkflowsList({ copilot_id }: { copilot_id: string }) {
  const { data: flows, isLoading } = useSWR('flows/' + copilot_id, async () => (await getWorkflowsByBotId(copilot_id)).data);
  const flowsBase = `/copilot/${copilot_id}/flows`;

  return (
    <ul className="px-2 space-y-2">
      {
        isLoading ? <Loader /> : _.isEmpty(flows?.workflows) ? <EmptyBlock>
          <p className="text-sm text-gray-500">No flows yet</p>
        </EmptyBlock> :
          flows?.workflows.map((flow, i) => (
            <li key={i}>
              <NavLink
                href={flowsBase + "/?workflow_id=" + flow._id}
                matchSearchParams
                className="flex items-center rounded border px-4 py-2 text-sm font-medium text-accent-foreground transition duration-150 ease-in-out "
                activeClassName="border-gray-300 bg-accent"
              >
                {flow.name}
              </NavLink>
            </li>

          ))
      }
    </ul>
  )
}
