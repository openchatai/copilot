import { Form, FormField, FormDescription, FormMessage, FormLabel, FormItem, FormControl } from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import _ from "lodash";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { ActionType, actionSchema } from "./schema";
import { apiMethods } from "@/types/utils";
import React from "react";
import { cn } from "@/lib/utils";


export function ActionForm({
    defaultValues,
    onSubmit,
    footer,
    className
}: {
    defaultValues?: ActionType,
    // eslint-disable-next-line no-unused-vars
    onSubmit?: (data: ActionType, defaultValues?: ActionType) => void
    // eslint-disable-next-line no-unused-vars
    footer?: (form: ReturnType<typeof useForm<ActionType>>) => React.ReactNode
    className?: string
}) {

    const form = useForm<ActionType>({
        resolver: zodResolver(actionSchema),
        defaultValues,
    });

    const { fields: headerFields, append: appendHeaderField, remove: removeHeaderField } = useFieldArray({
        name: "headers",
        control: form.control,
    })

    const { fields: parameterFields, append: appendParameterField, remove: removeParameterField } = useFieldArray({
        name: "parameters",
        control: form.control,
    })

    function handleSubmit(data: ActionType) {
        onSubmit?.(data, defaultValues);
    }

    return (
        <Form {...form}>
            <form className={cn("max-w-full w-full", className)} onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="w-full">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="required-label">
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="required-label">
                                    Description
                                </FormLabel>
                                <FormControl>
                                    <Textarea minRows={2} {...field} />
                                </FormControl>
                                <FormDescription />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center data-[valid=false]:!border-destructive h-12 gap-0.5 p-1 overflow-hidden border border-border w-full m-0 bg-white shadow-sm rounded-md focus:outline-none text-sm focus-visible:outline-none transition-colors">
                        <Select {..._.omit(form.register('request_type'), ['ref'])}
                            onValueChange={(v) => {
                                form.register('request_type').onChange({
                                    target: {
                                        name: 'request_type',
                                        value: v
                                    }
                                });
                            }}>
                            <SelectTrigger className="ring-0 w-fit h-full p-1.5 border-0 text-xs font-semibold" ref={form.register('request_type').ref}>
                                <SelectValue placeholder="Method" />
                            </SelectTrigger>

                            <SelectContent className="max-w-fit">
                                {apiMethods.map((method) => (
                                    <SelectItem key={method} value={method} className="py-1.5">
                                        {method}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input placeholder="API Endpoint...." {...form.register('api_endpoint')} className="flex-1 border-0 h-full py-1.5 shadow-none" />
                    </div>

                    <div>

                        <div className="flex items-center justify-between">
                            <Label>
                                Headers
                            </Label>
                            <Button variant="link" size="fit"
                                onClick={() => appendHeaderField({ key: "", value: "" }, {
                                    shouldFocus: true
                                })}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-2 w-full">
                            {
                                headerFields.map((field, index) => {
                                    const errorMessage = form.formState.errors.headers?.[index]?.value?.message;
                                    const isValid = errorMessage === undefined;
                                    return (
                                        <div className="flex items-center gap-2 justify-between" key={field.id}>
                                            <Input placeholder="Key"
                                                {...form.register(`headers.${index}.key`)}
                                                data-valid={isValid}
                                            />

                                            <Input placeholder="Value"
                                                data-valid={isValid}
                                                {...form.register(`headers.${index}.value`)}
                                            />

                                            <button className="p-2 text-destructive"
                                                type="button"
                                                onClick={() => removeHeaderField(index)}>
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <Label>
                                Parameters
                            </Label>
                            <Button variant="link" size="fit"
                                onClick={() => appendParameterField({ key: "", value: "" }, {
                                    shouldFocus: true
                                })}
                            ><Plus className="w-4 h-4" /></Button>
                        </div>
                        <div className="space-y-3" data-container='parameters'>
                            {
                                parameterFields.map((field, index) => {
                                    const errorMessage = form.formState.errors.parameters?.[index]?.value?.message;
                                    const isValid = errorMessage === undefined;
                                    return (<div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1" key={field.id}>
                                        <Input placeholder="Key"
                                            {...form.register(`parameters.${index}.key`)}
                                            data-valid={isValid}
                                        />
                                        <Input placeholder="Value"
                                            data-valid={isValid}
                                            {...form.register(`parameters.${index}.value`)}
                                        />
                                        <button className="shrink-0 p-2 text-destructive" type="button"
                                            onClick={() => removeParameterField(index)}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>)
                                })
                            }
                        </div>
                    </div>
                    <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="required-label">
                                    Body (JSON)
                                </FormLabel>
                                <FormControl>
                                    <Textarea minRows={3} {...field} />
                                </FormControl>
                                <FormDescription />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {footer?.(form)}
            </form>
        </Form>

    )
}
