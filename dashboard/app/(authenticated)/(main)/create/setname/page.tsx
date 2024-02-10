"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/lib/router-events";
import React, { useMemo } from "react";
import { useCreateCopilot } from "../CreateCopilotProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAsyncFn } from "react-use";
import { createCopilot } from "@/data/copilot";

type Props = {};

function SetNamePage() {
  const { state, dispatch } = useCreateCopilot();
  const router = useRouter();
  const [stateOfCreateCopilot, $createCopilot] = useAsyncFn(createCopilot);
  const isReadyToConfigure = useMemo(() => {
    if (!state.copilot_name) return false;
    return true;
  }, [state]);
  async function handleCreateCopilot() {
    if (!state.copilot_name) {
      toast.message("Please enter copilot name");
      return;
    }
    if (state.createdCopilot) {
      router.push(`/create/configure?copilot=${state.createdCopilot.id}`);
      return;
    }
    const response = await $createCopilot(state.copilot_name);
    if (response?.data?.id) {
      dispatch({ type: "SET_COPILOT", payload: response.data });
      router.push(`/create/configure?copilot=${response.data.id}`);
    } else {
      toast.error("Failed to create copilot");
    }
  }
  return (
    <div className="flex-center size-full">
      <Card
        className="flex max-h-[80%] min-h-fit w-full max-w-xl flex-col items-start *:w-full"
        hoverEffect={false}
      >
        <CardHeader className="border-b">
          <CardTitle>Let's give your project a name 🤖</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto py-10">
          <Label htmlFor="copilotName" className="font-semibold">
            Project Name
          </Label>
          <Input
            id="copilotName"
            className="mt-1"
            value={state.copilot_name}
            onChange={(ev) =>
              dispatch({ type: "CHANGE_NAME", payload: ev.target.value })
            }
          />
        </CardContent>
        <CardFooter className="flex w-full items-center justify-between border-t bg-secondary py-2">
          <Button variant="secondary">
            <Link href="/create/">Back</Link>
          </Button>
          <Button
            loading={stateOfCreateCopilot.loading}
            disabled={!isReadyToConfigure}
            onClick={handleCreateCopilot}
          >
            Configure
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SetNamePage;
