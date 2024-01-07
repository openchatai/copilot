"use client";
import React, { useMemo } from "react";
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
import { deleteCopilot, updateCopilot } from "@/data/copilot";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { CopyButton } from "@/components/headless/CopyButton";
import { mutate } from "swr";
import { useAsyncFn } from "react-use";
import { TableCell } from '@/components/ui/table';
import { EmptyBlock } from '@/components/domain/EmptyBlock';
import { Plus } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Section } from "./Section";
import { SingleVariableForm } from "./SingleVariableForm";
import { useVariables } from "./useVariables";

function VariablesSection({ copilot_id }: { copilot_id: string }) {
  const [vars, createVar, status] = useVariables(copilot_id);
  const data = useMemo(() => {
    const _data: { name: string; value: string }[] = [];
    const __data = vars.data;
    if (__data) {
      Object.keys(__data).forEach((key) => {
        const val = __data[key];
        _data.push({ name: key, value: val || '' });
      })
    }
    return _data
  }, [vars])

  return <Section header={<header className="flex items-center justify-between w-full">
    <h2 className="text-base font-bold">Global Variables</h2>
    <Popover>
      <PopoverTrigger asChild>
        <Button size='fit' variant='outline' className="p-1.5">
          <Plus className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='mx-2'>
        <SingleVariableForm onSubmit={(data) => { createVar(data.name, data.value) }} footer={<Button loading={status.loading} type='submit' size='xs'>create</Button>} />
      </PopoverContent>
    </Popover>
  </header>}>
    <div>
      <table className='w-full table'>
        <thead>
          <tr className="[&>th]:p-1">
            <th className='font-medium text-left'>Name</th>
            <th className='font-medium text-left'>Value</th>
          </tr>
        </thead>
        <tbody>
          {_.isEmpty(['']) ? <tr>
            <TableCell colSpan={2}>
              <EmptyBlock />
            </TableCell>
          </tr> : data.map((variable, index) => {
            return <tr className='bg-white [&>td]:p-1' key={index}>
              <td>
                <Input defaultValue={variable.name} />
              </td>
              <td>
                <Input defaultValue={variable.value} />
              </td>
            </tr>
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="p-2">
              <div className="w-full flex gap-2 items-center justify-end">
                <Button variant='destructiveOutline' size='sm'>Reset</Button>
                <Button size='sm'>Save</Button>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </Section>
}

export default function GeneralSettingsPage() {
  const { token, id: copilotId, name: copilotName } = useCopilot();
  const [Name, setName] = React.useState(copilotName);
  const { replace } = useRouter();
  const [deleteCopilotstate, $deleteCopilot] = useAsyncFn(deleteCopilot);
  const [updateCopilotState, $updateCopilot] = useAsyncFn(updateCopilot);

  async function handleDelete() {
    const { data } = await $deleteCopilot(copilotId);
    if (data.success) {
      toast({
        variant: "success",
        title: "Copilot deleted",
        description: "Your copilot has been deleted successfully.",
      });
      _.delay(() => replace("/"), 1000);
    }
  }

  async function handleSave() {
    if (Name === copilotName || Name.trim().length < 1) return;
    const { data } = await $updateCopilot(copilotId, { name: Name });
    if (data.chatbot) {
      toast({
        variant: "success",
        title: "Copilot updated",
        description: "Your copilot has been updated successfully.",
      });
      mutate(copilotId);
    }
  }
  return (
    <div className="flex h-full w-full flex-col overflow-hidden [&_input]:font-semibold">
      <HeaderShell className="items-center justify-between">
        <h1 className="text-lg font-bold text-secondary-foreground">
          General settings
        </h1>
        <div className="space-x-2">
          <Button size="sm" loading={updateCopilotState.loading} onClick={handleSave}>
            Save
          </Button>
        </div>
      </HeaderShell>

      <div className="flex-1 overflow-auto bg-accent/25 px-4 py-8">
        <div className="container max-w-screen-md space-y-10">
          <Section>
            <div className="space-y-1.5">
              <Label>
                Copilot Name
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  className="w-10/12"
                  defaultValue={copilotName}
                  onChange={(ev) => {
                    setName(ev.target.value);
                  }}
                  value={Name}
                />
              </div>
            </div>
          </Section>
          <Section title="Metadata">
            <Label>
              Token
            </Label>
            <div className="flex items-center justify-between gap-2">
              <Input className="flex" readOnly defaultValue={token} />
              <Button variant="outline" asChild>
                <CopyButton text={token}>Copy</CopyButton>
              </Button>
            </div>
          </Section>
          <VariablesSection copilot_id={copilotId} />
          <Section title="Danger Zone" intent="danger">
            <div className="flex flex-row items-center justify-between">
              <div>
                <Label className="text-base font-semibold">
                  Delete Copilot
                </Label>
                <p className="text-sm font-normal">
                  This action can't be reverted.
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
                    <Button variant="destructive" loading={deleteCopilotstate.loading} onClick={handleDelete}>
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
