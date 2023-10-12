import React from "react";
import { HeaderShell } from "@/app/(main)/_parts/Header";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function GeneralSettingsPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <HeaderShell className="items-center justify-between">
        <h1 className="text-lg font-bold text-secondary-foreground">
          General settings
        </h1>
        <div className="space-x-2">
          <Button size="sm">Save</Button>
          <Button size="sm" variant="secondary">
            Cancel
          </Button>
        </div>
      </HeaderShell>

      <div className="flex-1 overflow-auto bg-accent/25 px-4 py-8">
        <div className="container max-w-screen-sm space-y-10">
          <section className="block rounded-lg border border-border bg-white shadow shadow-accent">
            <div className="space-y-1 px-8 py-5">
              <Label className="text-base font-semibold text-accent-foreground/50">
                Copilot Name
              </Label>
              <Input />
            </div>
            <Separator className="my-2" />

            <div className="space-y-1 px-8 py-5">
              <Label className="text-base font-semibold text-accent-foreground/50">
                Copilot Id
              </Label>
              <Input />
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-accent-foreground">
              Custom Context
            </h2>
            <p className="mb-1 text-sm font-normal">
              You can change your copilot initial context / prompt from here.
              also you can change the copilot response language.
            </p>
            <div className="mt-4 block rounded-lg border border-border bg-white shadow shadow-accent">
              <div className="space-y-1 px-8 py-5">
                <Label className="text-base font-semibold text-accent-foreground/50 mb-2">Manual context</Label>
                <Textarea />
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
                <Button variant="destructive" size={"sm"}>
                  Delete
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
