'use client';
import React, { useState } from 'react'
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTrigger, AlertDialogCancel, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react';
import { useAsyncFn } from 'react-use';
import { VariableType, createVariable } from '@/data/copilot';
import _ from 'lodash';
import { useCopilot } from '../../CopilotProvider';
import { toast } from 'sonner';

type Props = {
    // eslint-disable-next-line no-unused-vars
    onSubmit?: (data: VariableType) => void,
    footer?: React.ReactNode,
}

export function SingleVariableForm({ onSubmit, footer }: Props) {
    async function handleOnSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        const name = data.get('name') as string
        const value = data.get('value') as string
        console.log(name, value);
        onSubmit?.({ name, value })
    }
    return (
        <form onSubmit={handleOnSubmit} className='space-y-2 contents'>
            <div>
                <Label>
                    Name
                </Label>
                <Input type='text' required name='name' placeholder='HEADER_NAME' />
            </div>
            <div>
                <Label>
                    Value
                </Label>
                <Textarea minRows={2} name='value' required maxRows={4} placeholder='HEADER_VALUE' />
            </div>
            {footer}
        </form>
    )
}

export function AddSingleVariable() {
    const [state, $createVariable] = useAsyncFn(createVariable);
    const { id: copilotId } = useCopilot()
    const [
        dialogOpen,
        setDialogOpen,
    ] = useState(false)
    return (
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Add Variable</AlertDialogTitle>
                </AlertDialogHeader>
                <div>
                    <SingleVariableForm
                        onSubmit={async (_data) => {
                            const { data } = await $createVariable(copilotId, [_data])
                            if (data.message) {
                                toast.success("Variable Added Successfully")
                                _.delay(() => setDialogOpen(false), 1000)
                            }
                        }}
                        footer={
                            <AlertDialogFooter>
                                <AlertDialogCancel asChild>
                                    <Button variant='secondary'>Cancel</Button>
                                </AlertDialogCancel>
                                <Button type='submit' loading={state.loading}>Add</Button>
                            </AlertDialogFooter>
                        }
                    />
                </div>
            </AlertDialogContent>
            <AlertDialogTrigger asChild>
                <Button>
                    <PlusCircle size={20} className='me-1' />
                    Add Variable
                </Button>
            </AlertDialogTrigger>
        </AlertDialog>
    )
}