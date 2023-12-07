'use client';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import React from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';


const formSchema = z.object({
    title: z.string().min(2, {
        message: "title must be at least 2 characters.",
    }),
    description: z.string().min(2, {
        message: "description must be at least 2 characters.",
    }),
    edit_after_creation: z.boolean().default(false),
})


export default function CreateWorkflowForm() {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            edit_after_creation: false,
        }
    })
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button>
                    Create Flow
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Create Flow</AlertDialogTitle>
                    <AlertDialogDescription>
                        Flows are a sequence of steps that are executed when a user interacts with your bot.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="required-label">
                                        Title
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='required-label'>
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea minRows={3} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="edit_after_creation"
                            render={({ field }) => {
                                const { value, ...rest } = field;
                                return <FormItem className='flex items-center justify-between'>
                                    <FormLabel>
                                        Edit after creation
                                    </FormLabel>
                                    <FormControl>
                                        <Switch
                                            {...rest}
                                            checked={value}
                                            onCheckedChange={() => {
                                                field.onChange(!value)
                                            }}
                                            value={value ? 'on' : 'off'}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            }
                            }
                        />
                        <AlertDialogFooter className='!mt-5'>
                            <AlertDialogCancel type='button'>
                                Cancel
                            </AlertDialogCancel>
                            <Button type='submit'>
                                Create
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    )
}