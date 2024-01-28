"use client";
import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HeaderShell } from "@/components/domain/HeaderShell";
import { useCopilot } from "../../CopilotProvider";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import _ from "lodash";
import { CopyButton } from "@/components/headless/CopyButton";
import { TableCell } from '@/components/ui/table';
import { EmptyBlock } from '@/components/domain/EmptyBlock';
import { Plus, XCircle } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Section } from "./Section";
import { SingleVariableForm } from "./SingleVariableForm";
import { useVariables } from "./useVariables";
import { useForm } from "react-hook-form";
import { FieldArray } from "@/components/ui/FieldArray";
import { AnimatePresence, motion } from 'framer-motion';
import { Field, Form } from "@/components/ui/form";
import { useAsyncFn } from "react-use";
import { deleteCopilot, updateCopilot } from "@/data/copilot";
import { toast } from "sonner";
import { mutate } from "swr";

function VariablesSection() {
  const { id: copilotId } = useCopilot();
  const [
    formOpen,
    setFormOpen
  ] = React.useState(false);
  const {
    swr: { data: vars },
    createVarAsync,
    deleteVarAsync,
    asyncCreateStatus,
    asyncDeleteStatus
  } = useVariables(copilotId);

  const data = useMemo(() => {
    const _data: { name: string; value: string }[] = [];
    const __data = vars;
    if (__data) {
      Object.keys(__data).forEach((key) => {
        const val = __data[key];
        _data.push({ name: key, value: val || '' });
      })
    }
    return _data
  }, [vars])

  const form = useForm<{ d: { name: string; value: string }[] }>({
    values: {
      d: data
    }
  });

  const hasChanged = form.formState.isDirty;

  async function updateWhatChanged() {
    const changed = form.formState.dirtyFields.d;
    if (changed) {
      const changedData = changed.map((v, i) => {
        if (v.value === true || v.name === true) {
          return form.getValues().d.at(i)
        }
      }).filter((v) => !_.isUndefined(v))
      // @ts-ignore
      createVarAsync(changedData, true)
    }
  }

  return <Section header={<header className="flex items-center justify-between w-full">
    <h2 className="text-base font-bold">Global Headers</h2>
    <Popover
      open={formOpen}
      onOpenChange={setFormOpen}
    >
      <PopoverTrigger asChild>
        <Button size='fit' variant='outline' className="p-1.5">
          <Plus className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='mx-2'>
        <SingleVariableForm onSubmit={async (data) => { (await createVarAsync([data])).message && setFormOpen(false) }} footer={<Button loading={asyncCreateStatus.loading} type='submit' size='xs'>create</Button>} />
      </PopoverContent>
    </Popover>
  </header>}>
    <div>
      <table className='w-full table'>
        <tbody>
          {_.isEmpty(data) ? <tr>
            <TableCell colSpan={3}>
              <EmptyBlock>
                <p className='text-sm'>No headers found</p>
              </EmptyBlock>
            </TableCell>
          </tr> :
            <FieldArray
              control={form.control}
              name="d"
              render={({ fields }) => {
                return fields.map((field, index) => {
                  return (
                    <AnimatePresence key={field.name}>
                      <motion.tr className='bg-white [&>td]:p-1' key={field.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.1, delay: index * 0.05, bounce: 0.1 }}
                      >
                        <td>
                          <Input readOnly type="text" {...form.register(`d.${index}.name`)} />
                        </td>
                        <td>
                          <Input type="text" {...form.register(`d.${index}.value`)} />
                        </td>
                        <td className="px-0 text-right">
                          <Button variant='destructive' size='icon'
                            loading={asyncDeleteStatus.loading}
                            onClick={() => {
                              confirm("are you sure ?") && deleteVarAsync(field.name)
                            }}>
                            <XCircle className='h-4 w-4' />
                          </Button>
                        </td>
                      </motion.tr>
                    </AnimatePresence>
                  )
                })
              }} />
          }
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="pt-3">
              <div className="w-full flex gap-2 items-center justify-end">
                <Button disabled={!hasChanged} variant='destructiveOutline' onClick={() => form.reset()} size='sm'>Reset</Button>
                <Button size='sm' disabled={!hasChanged} onClick={updateWhatChanged}>Save</Button>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </Section>
}

function GeneralSettingsSection() {
  const { id: copilotId, name: copilotName, website } = useCopilot();
  const [state, handleUpdateCopilot] = useAsyncFn(updateCopilot)
  const form = useForm<{ copilotName: string; website: string }>({
    values: {
      copilotName,
      website
    }
  });

  const hasChanged = form.formState.isDirty;

  return <Section>
    <Form {...form}>
      <form className="contents space-y-2" onSubmit={form.handleSubmit(async ({ copilotName, website }) => {
        const { data } = await handleUpdateCopilot(copilotId, { name: copilotName, website });
        console.log(data)
        if (data.chatbot) {
          toast.success("Copilot updated successfully")
          mutate(copilotId)
        } else {
          toast.error("Copilot update failed")
        }
      })}>
        <Field label="Copilot Name" control={form.control} name="copilotName" render={(field) => <Input {...field} />} />
        <Field label="Website" control={form.control} name="website" render={(field) => <Input {...field} />} />
        <footer className="flex items-center justify-end gap-2 mt-3">
          <Button variant="destructiveOutline" disabled={!hasChanged} type="reset" size="sm">
            Reset
          </Button>
          <Button size="sm" loading={state.loading} type="submit" disabled={!hasChanged}>Save</Button>
        </footer>
      </form>
    </Form>
  </Section >
}

function MetadataSection() {
  const { token } = useCopilot();
  return <Section title="Metadata">
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
}

function DeleteSection() {
  const { id: copilotId } = useCopilot();
  const [state, handleDeleteCopilot] = useAsyncFn(async () => deleteCopilot(copilotId));

  return <Section
    title="Danger Zone" intent="danger" className="shadow shadow-destructive/30">
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
          <Button variant="destructive" size="sm" loading={state.loading}>
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
            <Button
              variant="destructive"
              loading={state.loading}
              onClick={async () => {
                const { data } = await handleDeleteCopilot()
                if (data.success) {
                  toast.success("Copilot deleted successfully")
                } else {
                  toast.error("Copilot deletion failed")
                }
              }}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </Section>
}

export default function GeneralSettingsPage() {


  return (
    <div className="flex h-full w-full flex-col overflow-hidden [&_input]:font-semibold">
      <HeaderShell className="items-center justify-between">
        <h1 className="text-lg font-bold text-secondary-foreground">
          General settings
        </h1>
      </HeaderShell>

      <div className="flex-1 overflow-auto bg-accent/25 px-4 py-8">
        <div className="container max-w-screen-md space-y-10">
          <GeneralSettingsSection />
          <VariablesSection />
          <MetadataSection />
          <DeleteSection />
        </div>
      </div>
    </div>
  );
}
