import { Field, Form } from "@/components/ui/form";
import { FieldPath, FieldValues, FormState, useForm } from "react-hook-form";
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
import { FieldArray } from "@/components/ui/FieldArray";
import { FormErrorMessage } from "@/components/ui/FieldError";

function isValidField<
    TValues extends FieldValues = FieldValues,
    TName extends FieldPath<TValues> = FieldPath<TValues>
>(
    formState: FormState<TValues>,
    name: TName
) {
    return formState.errors?.[name] === undefined;
}

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


    function handleSubmit(data: ActionType) {
        onSubmit?.(data, defaultValues);
    }

    return (
        <Form {...form}>
            <form className={className} onSubmit={form.handleSubmit(handleSubmit)}>
                <Field
                    control={form.control}
                    name="name"
                    description="A Descriptive name for the action"
                    label="Name"
                    required
                    render={(props) => <Input {...props} />}
                />
                <Field
                    control={form.control}
                    name="description"
                    description="A short description about the action, what it does, etc."
                    label="Description"
                    required
                    render={(props) => <Textarea minRows={2} {...props} />}
                />
                <div>
                    <div data-valid={isValidField(form.formState, 'request_type') ?? isValidField(form.formState, 'api_endpoint')} className="flex items-center data-[valid=false]:!border-destructive h-12 gap-0.5 p-0.5 overflow-hidden border border-border w-full m-0 bg-white shadow-sm rounded-md focus:outline-none text-sm focus-visible:outline-none transition-colors">
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
                    <div className="space-y-1.5 *:block">
                        <FormErrorMessage formState={form.formState} name="request_type" />
                        <FormErrorMessage formState={form.formState} name="api_endpoint" />
                    </div>
                </div>

                <Field
                    control={form.control}
                    name="body"
                    description="The body of the request in JSON format"
                    label="Body (JSON)"
                    render={(props) => <Textarea minRows={3} {...props} />}
                />

                <div>
                    <FieldArray
                        control={form.control}
                        name="headers"
                        render={({ fields, append, remove }) => {
                            return <>

                                <div className="flex items-center justify-between">
                                    <Label>
                                        Headers
                                    </Label>
                                    <Button variant="link" size="fit"
                                        onClick={() => append({ key: "", value: "" }, {
                                            shouldFocus: true
                                        })}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {
                                        fields.map((field, index) => {
                                            const isValid = isValidField(form.formState, `headers.${index}.value`)
                                            return (
                                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1" key={field.id}>
                                                    <input placeholder="Key"
                                                        className="reset-input"
                                                        {...form.register(`headers.${index}.key`)}
                                                        data-valid={isValid}
                                                    />

                                                    <input placeholder="Value"
                                                        className="reset-input"
                                                        data-valid={isValid}
                                                        {...form.register(`headers.${index}.value`)}
                                                    />

                                                    <button className="shrink-0 p-2 text-destructive"
                                                        type="button"
                                                        onClick={() => remove(index)}>
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </>
                        }}
                    />
                </div>

                <div>
                    <FieldArray
                        control={form.control}
                        name="parameters"
                        render={({ fields, append, remove }) => {
                            return <>

                                <div className="flex items-center justify-between">
                                    <Label>
                                        Parameters
                                    </Label>
                                    <Button variant="link" size="fit"
                                        onClick={() => append({ key: "", value: "" }, {
                                            shouldFocus: true
                                        })}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {
                                        fields.map((field, index) => {
                                            const isValid = isValidField(form.formState, `parameters.${index}.value`)
                                            return (
                                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1" key={field.id}>
                                                    <input
                                                        className="reset-input"
                                                        placeholder="Key"
                                                        {...form.register(`parameters.${index}.key`)}
                                                        data-valid={isValid}
                                                    />

                                                    <input
                                                        className="reset-input"
                                                        placeholder="Value"
                                                        data-valid={isValid}
                                                        {...form.register(`parameters.${index}.value`)}
                                                    />

                                                    <button className="shrink-0 p-2 text-destructive"
                                                        type="button"
                                                        onClick={() => remove(index)}>
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </>
                        }}
                    />
                </div>
                {footer?.(form)}
            </form>
        </Form>

    )
}
