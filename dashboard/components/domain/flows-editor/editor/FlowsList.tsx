import React, { useState } from "react";
import {
  Box,
  ChevronRightIcon,
  Pencil,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useController } from "../stores/Controller";
import { useMode } from "../stores/ModeProvider";
import { useSettings } from "../stores/Config";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { EmptyBlock } from "../../EmptyBlock";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FlowsList() {
  const [flowsPanelOpened, setFlowsPanel] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { reset } = useMode();
  const { maxFlows } = useSettings();
  const {
    createFlow,
    state: { flows, activeFlowId },
    setActiveFlow,
    deleteFlow,
  } = useController();
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const [name, description, focus] = [
      data.get("name"),
      data.get("description"),
      data.get("focus"),
    ];
    if (name && description) {
      createFlow({
        createdAt: Date.now(),
        name: name.toString(),
        description: description.toString(),
        focus: focus === "on" ? true : false,
      });
      setModalOpen(false);
    }
  }
  return (
    <div className="absolute inset-x-0 bottom-0 block bg-white shadow-lg transition">
      <div className="flex items-center justify-between border-y-2 border-border px-2 py-1">
        <button
          className="flex-1 space-x-2 text-start text-sm font-semibold uppercase"
          onClick={() => setFlowsPanel((pre) => !pre)}
        >
          <ChevronRightIcon
            className={cn(
              "inline text-base transition-transform",
              flowsPanelOpened ? "rotate-0" : "rotate-90",
            )}
          />
          <span>flows</span>
        </button>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader className="text-lg font-semibold">
              Create new flow
            </DialogHeader>
            <form onSubmit={onSubmit}>
              <Label htmlFor="name-input">Name</Label>
              <Input
                required
                id="name-input"
                defaultValue={"New Flow"}
                type="text"
                name="name"
                className="my-2"
              />
              <Label htmlFor="name-input">Description</Label>
              <Input
                required
                defaultValue={"A flow that does something"}
                id="description-input"
                type="text"
                name="description"
                className="my-2"
              />
              <div className="mt-2 space-x-1">
                <input
                  type="checkbox"
                  id="focus-input"
                  className="inline"
                  defaultChecked
                  name="focus"
                />
                <Label htmlFor="focus-input" className="inline">
                  Focus after creation?
                </Label>
              </div>
              <div className="mt-4 flex w-full items-center justify-end">
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
          <DialogTrigger
            className="text-primary"
            onClick={(ev) => {
              if (maxFlows && flows.length >= maxFlows) {
                alert(`You can only have ${maxFlows} flows at a time.`);
                ev.preventDefault();
                return;
              }
            }}
          >
            <PlusIcon className="w-5 h-5" />
          </DialogTrigger>
        </Dialog>
      </div>
      <div
        className={cn(
          "block overflow-auto transition-all",
          flowsPanelOpened
            ? "h-52 animate-in fade-in"
            : "h-0 animate-out fade-out",
        )}
      >
        {flows.length === 0 ? (
          <EmptyBlock />
        ) : (
          <ul className="space-y-1 p-2">
            {flows?.map((flow, i) => {
              const isActive = flow.id === activeFlowId;
              return (
                <li key={i} data-flow-id={flow.id}>
                  <div
                    className={cn(
                      "flex w-full items-center justify-between rounded-md p-2 text-left text-base font-semibold transition-all duration-300 ease-in-out hover:bg-slate-100",
                      isActive ? "bg-slate-100" : "",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Box className="inline" />
                      <span>{flow.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-lg">
                      <button
                        title="edit this flow"
                        onClick={() => {
                          if (isActive) return;
                          setActiveFlow(flow.id);
                          reset();
                        }}
                        className="text-slate-500"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="text-rose-500"
                        onClick={() => {
                          confirm(
                            "Are you sure you want to delete this flow?",
                          ) && deleteFlow(flow.id);
                        }}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}