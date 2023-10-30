"use client";
import React, { useEffect, useState } from "react";
import {
  CodePreview,
  Controller,
  FlowArena,
  useController,
  transformPaths,
  trasnformEndpointNodesData,
  transformaEndpointToNode,
} from "@openchatai/copilot-flows-editor";
import { HeaderShell } from "@/components/domain/HeaderShell";
import { useCopilot } from "../../_context/CopilotProvider";
import useSwr, { mutate } from "swr";
import { getSwaggerByBotId } from "@/data/swagger";
import { Button } from "@/components/ui/button";
import {
  createWorkflowByBotId,
  deleteWorkflowById,
  getWorkflowById,
} from "@/data/flow";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import _ from "lodash";
import { useIsEditing } from "./_parts/useIsEditing";

function Header() {
  // editing => workflow_id // creating => undefined
  const [isEditing, workflow_id] = useIsEditing();
  const { replace } = useRouter();
  const { id: copilotId, name: copilotName } = useCopilot();
  const { loadPaths, state, reset: resetFlowEditor } = useController();

  const [loading, setLoading] = useState(false);
  const { isLoading: isSwaggerLoading, mutate: mutateSwagger } = useSwr(
    copilotId + "swagger_file",
    async () => getSwaggerByBotId(copilotId),
    {
      onSuccess: (data) => {
        if (!data) return;
        loadPaths(transformPaths(data.data.paths));
      },
    },
  );
  const isLoading = isSwaggerLoading || loading;

  async function handleSave() {}
  async function handleDelete() {
    if (!isEditing || !workflow_id) return;
    setLoading(true);
    const { data } = await deleteWorkflowById(workflow_id);
    if (data) {
      toast({
        title: "Workflow deleted",
        description: "Your workflow has been deleted.",
        variant: "success",
      });
      replace(`/copilot/${copilotId}/flows`, {
        scroll: false,
      });
      mutate(copilotId + "/workflows");
      setLoading(false);
    }
  }
  async function handleCreate() {
    if (isEditing) return;
    const firstFlow = _.first(state.flows);
    if (firstFlow) {
      setLoading(true);
      const steps = trasnformEndpointNodesData(firstFlow?.steps || []);
      const { data } = await createWorkflowByBotId(copilotId, {
        opencopilot: "0.1",
        info: {
          title: "My OpenCopilot definition",
          version: "1.0.0",
        },
        flows: [
          {
            name: firstFlow?.name,
            description: firstFlow?.description,
            steps: steps.map((step) => ({
              operation: "call",
              stepId: step.id,
              open_api_operation_id: step.operationId,
            })),
            requires_confirmation: true,
            on_success: [{}],
            on_failure: [{}],
          },
        ],
      });
      if (data.workflow_id) {
        toast({
          title: "Workflow created",
          description: "Your workflow has been created.",
          variant: "success",
        });
        replace(
          `/copilot/${copilotId}/flows/?workflow_id=${data.workflow_id}`,
          {
            scroll: false,
          },
        );
        mutate(copilotId + "/workflows");
      }
      setLoading(false);
    } else {
      toast({
        title: "Workflow not created",
        description: "You need at least one flow to create a workflow.",
        variant: "destructive",
      });
    }
  }
  return (
    <HeaderShell className="justify-between gap-2">
      <h1 className="text-lg font-bold text-accent-foreground">
        {copilotName}
      </h1>
      {isEditing ? (
        <div className="space-x-1">
          <Button onClick={handleSave} disabled={isLoading}>
            Save
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            variant="destructive"
          >
            Delete
          </Button>
        </div>
      ) : (
        <div className="space-x-1">
          <Button onClick={handleCreate} disabled={isLoading}>
            Create
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              confirm("Are you sure??") && resetFlowEditor();
              mutateSwagger();
            }}
          >
            Reset
          </Button>
        </div>
      )}
    </HeaderShell>
  );
}
const flows = [
  {
    createdAt: 1698626518815,
    name: "New Flow",
    description: "A flow that does something",
    focus: true,
    steps: [
      {
        width: 250,
        height: 115,
        id: "loc6dg5rzvqwjr3n47",
        type: "endpointNode",
        data: {
          path: "/v2.0/metering/metering-label-rules",
          method: "get",
          description:
            "Lists a summary of all l3 metering label rules belonging to the specified tenant.\n",
          operationId: "listMeteringLabelRules",
          produces: ["application/json"],
          responses: {
            "200": {
              description: "200 response",
              examples: {
                "application/json":
                  '{\n    "metering_label_rules": [\n        {\n            "remote_ip_prefix": "20.0.0.0/24",\n            "direction": "ingress",\n            "metering_label_id": "e131d186-b02d-4c0b-83d5-0c0725c4f812",\n            "id": "9536641a-7d14-4dc5-afaf-93a973ce0eb8",\n            "excluded": false\n        },\n        {\n            "remote_ip_prefix": "10.0.0.0/24",\n            "direction": "ingress",\n            "metering_label_id": "e131d186-b02d-4c0b-83d5-0c0725c4f812",\n            "id": "ffc6fd15-40de-4e7d-b617-34d3f7a93aec",\n            "excluded": false\n        }\n    ]\n}',
              },
            },
          },
          summary: "List metering label rules",
        },
        draggable: false,
        position: {
          x: 0,
          y: 0,
        },
        positionAbsolute: {
          x: 0,
          y: 0,
        },
      },
      {
        id: "loc6dgvm0opcqfggdvba",
        type: "endpointNode",
        data: {
          path: "/v2.0/metering/metering-label-rules",
          method: "post",
          description: "Creates a l3 metering label rule.\n",
          operationId: "createMeteringLabelRule",
          produces: ["application/json"],
          responses: {
            "201": {
              description: "201 response",
              examples: {
                "application/json":
                  '{\n    "metering_label_rule": {\n        "remote_ip_prefix": "10.0.1.0/24",\n        "direction": "ingress",\n        "metering_label_id": "e131d186-b02d-4c0b-83d5-0c0725c4f812",\n        "id": "00e13b58-b4f2-4579-9c9c-7ac94615f9ae",\n        "excluded": false\n    }\n}',
              },
            },
          },
          summary: "Create metering label rule",
        },
        draggable: false,
        position: {
          x: 0,
          y: 150,
        },
        width: 250,
        height: 99,
      },
    ],
    id: "loc6de743yp05gf6wqa",
    updatedAt: 1698626522353,
  },
];
export default function FlowsPage({
  params: { copilot_id },
}: {
  params: { copilot_id: string };
}) {
  const [isEditing, workflow_id] = useIsEditing();
  console.log({ isEditing, workflow_id });
  const [state, setState] = useState<any>();
  useSwr(workflow_id, getWorkflowById, {
    onSuccess: (data) => {
      const workflow = data.data;
      const s = {
        ...state,
        flows: workflow.flows.map((flow) => ({
          ...flow,
          steps: transformaEndpointToNode(flow?.steps || []),
        })),
      };
      setState(s);
    },
  });
  useEffect(() => {
    console.log("state changed", state);
  }, [state]);
  return (
    // @ts-ignore
    <Controller maxFlows={1} initialState={state} onChange={setState}>
      <div className="flex h-full w-full flex-col">
        <Header />
        <div className="relative flex h-full w-full flex-1 items-start justify-between">
          <FlowArena />
          <CodePreview />
        </div>
      </div>
    </Controller>
  );
}
