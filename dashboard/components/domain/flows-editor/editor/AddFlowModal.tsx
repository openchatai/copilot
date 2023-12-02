'use client';
import React, { useState } from 'react'
import { useController } from '..';
import { useSettings } from '../stores/Config';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';


export function AddFlowModal() {
    const {
        createFlow,
        state: { flows }
    } = useController();
    const { maxFlows } = useSettings();
    const [modalOpen, setModalOpen] = useState(false);
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
                asChild
                onClick={(ev) => {
                    if (maxFlows && flows.length >= maxFlows) {
                        alert(`You can only have ${maxFlows} flows at a time.`);
                        ev.preventDefault();
                        return;
                    }
                }}
            >
                <Button size="fluid">
                    Create New Flow
                </Button>
            </DialogTrigger>
        </Dialog>
    )
}
