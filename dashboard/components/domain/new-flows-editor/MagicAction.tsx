import React from 'react'
import {
    AlertDialog, AlertDialogContent, AlertDialogTitle,
    AlertDialogCancel, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAsyncFn } from 'react-use';
import { createDynamicFlowsByBotId } from '@/data/new_flows';
import { z } from 'zod';
import { useController } from './Controller';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Sparkles } from "lucide-react";
import { toast } from 'sonner';
import { useCopilot } from '@/app/(authenticated)/(copilot)/copilot/CopilotProvider';

const schema = z.object({
    prompt: z.string().min(20)
})

export function MagicAction({ defaultValue }: { defaultValue?: string }) {
    const [open, setOpen] = React.useState(false);
    const [state, create] = useAsyncFn(createDynamicFlowsByBotId)
    const { id: copilotId } = useCopilot();
    const { dispatch } = useController();

    const form = useForm<z.infer<typeof schema>>({
        defaultValues: {
            prompt: defaultValue
        },
        resolver: zodResolver(z.object({
            prompt: z.string().min(20)
        }))
    })

    const handleSubmit = async (data: z.infer<typeof schema>) => {
        const { data: _data } = await create(copilotId, data.prompt);
        setOpen(false);
        if (_data.actions) {
            // create blocks for each action
            dispatch({
                type: "PATCH_CREATE_BLOCKS_FROM_ACTIONS",
                payload: _data.actions
            })
            toast.success('Blocks added successfully')
        }
    }
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button size='sm' variant='outline'>
                    Build flow with AI (beta)
                    <Sparkles className='size-4 ms-1.5'/>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent asChild>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <Form {...form}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Describe your flow
                            </AlertDialogTitle>
                        </AlertDialogHeader>
                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea {...field} placeholder='e.g. get the latest sales analytics and then add discount on all low-sales prooducts then email the admin that the discount was applied' minRows={2} />
                                    </FormControl>
                                    <FormDescription>
                                        Try to detailed as much as you can and make sure to focus on the order of actions
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <AlertDialogFooter>
                            <AlertDialogCancel asChild>
                                <Button variant='secondary'>Cancel</Button>
                            </AlertDialogCancel>
                            <Button loading={state.loading} variant='default' type='submit'>Create</Button>
                        </AlertDialogFooter>
                    </Form>

                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
