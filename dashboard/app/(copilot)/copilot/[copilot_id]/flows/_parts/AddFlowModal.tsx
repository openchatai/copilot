'use client';
import React, { useState } from 'react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogCancel, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogContent, AlertDialogTrigger, AlertDialogAction } from '@/components/ui/alert-dialog';

export function AddFlowModal() {
    const [modalOpen, setModalOpen] = useState(false);
    // this should create new flow on the server and then update the state
    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const [name, description, focus] = [
            data.get("name"),
            data.get("description"),
            data.get("focus"),
        ];
        if (name && description) {
            console.log({ name, description });
            setModalOpen(false);
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
                        <AlertDialogAction type='submit'>
                            Create
                        </AlertDialogAction>
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
