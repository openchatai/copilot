'use client';
import React, { useState } from 'react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogCancel, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogContent, AlertDialogTrigger, AlertDialogAction } from '@/components/ui/alert-dialog';
import { mutateFlows } from './WorkflowsList';
import { useCopilot } from '../../../_context/CopilotProvider';
import { createWorkflowByBotId } from '@/data/flow';
import { toast } from '@/components/ui/use-toast';

export function AddFlowModal() {
    const [modalOpen, setModalOpen] = useState(false);
    const { id: copilotId } = useCopilot()
    const [loading, setLoading] = useState(false)
    // this should create new flow on the server and then update the state
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        setLoading(true)
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const [name, description] = [
            data.get("name")?.toString(),
            data.get("description")?.toString(),
        ];
        if (name && description) {
            try {
                const { data } = await createWorkflowByBotId(copilotId, {
                    info: {},
                    name,
                    description,
                    on_failure: [],
                    steps: [], on_success: [],
                    requires_confirmation: true, opencopilot: {
                        version: "0.0.1",
                    },
                })
                if (data.workflow_id) {
                    toast({
                        title: 'Flow created',
                        description: 'Your flow has been created',
                        variant: 'success'
                    })
                }
                mutateFlows(copilotId);
                setLoading(false)
                setModalOpen(false);
            } catch (error) {
                setLoading(false);
                toast({
                    title: 'Error',
                    description: 'Something went wrong',
                    variant: 'destructive'
                })
            }
        }
    }
    return (
        <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
            <AlertDialogContent asChild>
                <form onSubmit={onSubmit}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Create new flow
                        </AlertDialogTitle>
                    </AlertDialogHeader>
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
                    <AlertDialogFooter className='space-x-4'>
                        <Button type='submit' loading={loading}>
                            Create
                        </Button>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
            <AlertDialogTrigger asChild >
                <Button size='fluid'>
                    Create New Flow
                </Button>
            </AlertDialogTrigger>
        </AlertDialog>
    )
}
