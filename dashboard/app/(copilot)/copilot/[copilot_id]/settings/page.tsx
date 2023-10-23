"use client";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HeaderShell } from "@/components/domain/HeaderShell";
import { useCopilot } from "../../_context/CopilotProvider";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCopilot } from "@/data/copilot";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
export default function GeneralSettingsPage() {
  const { token, id: copilotId, name: copilotName } = useCopilot();
  const { replace } = useRouter();
  async function handleDelete() {
    const response = await deleteCopilot(copilotId);
    if (response.data.success) {
      toast({
        variant: "success",
        title: "Copilot deleted",
        description: "Your copilot has been deleted successfully.",
      });
      _.delay(() => replace("/"), 1000);
    }
  }
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <HeaderShell className="items-center justify-between">
        <h1 className="text-lg font-bold text-secondary-foreground">
          General settings
        </h1>
        <div className="space-x-2">
          <Button size="sm">Save</Button>
          <Button size="sm" variant="destructive">
            Cancel
          </Button>
        </div>
      </HeaderShell>

      <div className="flex-1 overflow-auto bg-accent/25 px-4 py-8">
        <div className="container max-w-screen-md space-y-10">
          <section className="block rounded-lg border border-border bg-white shadow shadow-accent">
            <div className="space-y-1.5 px-8 py-5">
              <Label className="text-base font-semibold text-accent-foreground/80">
                Copilot Name
              </Label>
              <div className="flex items-center gap-2">
                <Input className="w-10/12" defaultValue={copilotName} />
                <p className="text-xs">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                  Culpa, a totam earum rem suscipit illum voluptas facere
                </p>
              </div>
            </div>
          </section>

          <section className="block ">
            <h2 className="mb-4 text-base font-bold text-accent-foreground">
              Metadata
            </h2>
            <div className="rounded-lg border border-border bg-white shadow shadow-accent">
              <div className="space-y-1.5 px-8 py-5">
                <Label className="text-base font-semibold text-accent-foreground/80">
                  Token
                </Label>
                <div className="flex items-center justify-between gap-2">
                  <Input className="flex" defaultValue={token} />
                  <Button variant="outline">Copy</Button>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="space-y-1.5 px-8 py-5">
                <Label className="text-base font-semibold text-accent-foreground/80">
                  Copilot Id
                </Label>
                <div className="flex items-center justify-between gap-2">
                  <Input className="flex" defaultValue={copilotId} />
                  <Button variant="outline">Copy</Button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-bold text-destructive">
              Danger Zone
            </h2>
            <div className="block rounded-lg border border-border bg-white px-8 py-5 shadow shadow-accent">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-accent-foreground">
                    Delete Assistant
                  </h3>
                  <p className="text-sm font-normal">
                    This action can't be reverted. Please proceed with caution.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      Are you sure you want to delete this assistant?
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                      This action can't be reverted. Please proceed with
                      caution.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel asChild>
                        <Button variant="outline">Cancel</Button>
                      </AlertDialogCancel>
                      <Button variant="destructive" onClick={handleDelete}>
                        Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
