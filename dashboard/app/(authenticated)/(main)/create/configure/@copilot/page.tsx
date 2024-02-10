"use client";
import { useCreateAction } from "@/hooks/useActions";
import { useSwaggerAdd } from "@/hooks/useAddSwagger";
import { atom, useAtom } from "jotai";
import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { useCreateCopilot } from "../../CreateCopilotProvider";
import { getActionsByBotId } from "@/data/actions";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { methodVariants } from "@/components/domain/MethodRenderer";
import { cn } from "@/lib/utils";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GetActionsFromSwagger } from "@/components/domain/SwaggerUpload";
import { toast } from "sonner";
import { ActionForm } from "@/components/domain/action-form/ActionForm";
import { PlusIcon, Trash2Icon, UploadCloudIcon } from "lucide-react";

const formDialog = atom({
  swagger: false,
  manually: false,
});
const revalidateActions = (copilot_id: string) =>
  mutate(copilot_id + "/actions");

export default function CopilotConfigurations() {
  const { state, dispatch } = useCreateCopilot();
  const createdCopilot = state.createdCopilot!;
  const [addActionState, addAction] = useCreateAction(state.createdCopilot!.id);
  const [swaggerFiles, setSwaggerFiles] = useState<File[]>([]);
  const [addSwaggerState, addSwagger] = useSwaggerAdd({
    copilotId: createdCopilot!.id,
  });
  const [dialogs, setDialogs] = useAtom(formDialog);
  const { data: actions } = useSWR(
    createdCopilot ? createdCopilot.id + "/actions" : null,
    async () =>
      createdCopilot.id ? await getActionsByBotId(createdCopilot.id) : null,
  );
  async function addActionFromSwagger() {
    const swaggerFile = _.first(swaggerFiles);
    if (swaggerFile && createdCopilot) {
      addSwagger({
        swagger: swaggerFile,
        onSuccess(data) {
          revalidateActions(createdCopilot.id);
          setSwaggerFiles([]);
          setDialogs({
            ...dialogs,
            swagger: false,
          });
        },
        onError(data) {
          setSwaggerFiles([]);
        },
      });
    }
  }
  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-end space-x-2">
        {/* Via Form */}
        <AlertDialog
          open={dialogs.manually}
          onOpenChange={(open) =>
            setDialogs({
              ...dialogs,
              manually: open,
            })
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader className="flex w-full flex-row items-center justify-between">
              <AlertDialogTitle className="flex-1 text-lg font-bold">
                Define API action
              </AlertDialogTitle>
            </AlertDialogHeader>
            <ActionForm
              className="no-scrollbar flex-1 space-y-2.5 overflow-auto"
              onSubmit={async (values) => {
                if (createdCopilot) {
                  const { data } = await addAction(values);
                  if (data) {
                    toast.success("Action created successfully");
                    setDialogs({
                      ...dialogs,
                      manually: false,
                    });
                    revalidateActions(createdCopilot.id);
                  }
                }
              }}
              footer={() => (
                <AlertDialogFooter className="mt-5">
                  <AlertDialogCancel asChild>
                    <Button variant="outline">Cancel</Button>
                  </AlertDialogCancel>
                  <Button type="submit" loading={addActionState.loading}>
                    Create Action
                  </Button>
                </AlertDialogFooter>
              )}
            />
          </AlertDialogContent>
          <AlertDialogTrigger asChild>
            <Button className="space-x-1" size="xs" variant="secondary">
              <PlusIcon className="h-4 w-4" />
              <span>Add action manually</span>
            </Button>
          </AlertDialogTrigger>
        </AlertDialog>
        {/* Via swagger Def file */}
        <AlertDialog
          open={dialogs.swagger}
          onOpenChange={(open) =>
            setDialogs({
              ...dialogs,
              swagger: open,
            })
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex-1 text-lg font-bold">
                Import from Swagger
              </AlertDialogTitle>
            </AlertDialogHeader>
            <GetActionsFromSwagger
              swaggerFiles={swaggerFiles || []}
              onChange={(f) => {
                setSwaggerFiles(f);
              }}
            />
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Cancel</Button>
              </AlertDialogCancel>
              <Button
                onClick={addActionFromSwagger}
                loading={addSwaggerState.loading}
              >
                Import
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
          <AlertDialogTrigger asChild>
            <Button className="space-x-1" size="xs" variant="secondary">
              <UploadCloudIcon className="h-4 w-4" />
              <span>Import actions from Swagger file</span>
            </Button>
          </AlertDialogTrigger>
        </AlertDialog>
      </div>
      <div className="flex max-h-60 flex-col items-start gap-2 overflow-auto px-2 py-1">
        {_.isEmpty(actions?.data) ? (
          <div className="mx-auto">
            <EmptyBlock>
              <div className="text-center text-sm">
                <span className="block">No actions added yet.</span>
                <span className="block">
                  You can add one manually or import a bunch from swagger file
                </span>
              </div>
            </EmptyBlock>
          </div>
        ) : (
          _.map(actions?.data, (endpoint, index) => {
            return (
              <div
                key={index}
                className="flex w-full max-w-full shrink-0 items-center justify-between gap-4 overflow-hidden rounded-lg border border-border p-2 transition-colors"
              >
                <div className="flex flex-1 shrink-0 items-center justify-start overflow-hidden">
                  <div className="flex shrink-0 items-center gap-5 overflow-hidden">
                    <span
                      className={cn(
                        methodVariants({
                          method: endpoint.request_type,
                        }),
                      )}
                    >
                      {endpoint.request_type}
                    </span>
                    <p className="line-clamp-1 flex-1 overflow-ellipsis text-xs font-medium">
                      {endpoint.name || endpoint.api_endpoint}
                    </p>
                  </div>
                </div>
                <div className="space-x-2">
                  <button className="text-destructive">
                    <Trash2Icon
                      className="h-4 w-4"
                      onClick={() => confirm("are you sure")}
                    />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
