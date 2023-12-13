import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import {
    Select,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import _ from "lodash";
import { useCreateCopilot } from "../CreateCopilotProvider";
import { toast } from "@/components/ui/use-toast";
import { actionSchema } from "@/components/domain/action-form/schema";
import { FormValues, FormValuesWithId } from "./types";
import { apiMethods } from "@/types/utils";
import { createActionByBotId } from "@/data/actions";
import { mutate } from "swr";
export const revalidateActions = (copilot_id: string) => mutate(copilot_id + '/actions')

export function SwaggerForm({ defaultValues }: { defaultValues?: FormValuesWithId }) {
    const { state, dispatch } = useCreateCopilot();
    const form = useForm<FormValues>({
        resolver: zodResolver(actionSchema),
        defaultValues: defaultValues,
        mode: "onChange"
    });
    const { fields: headerFields, append: appendHeaderField, remove: removeHeaderField } = useFieldArray({
        name: "headers",
        control: form.control,
    })

    const { fields: parameterFields, append: appendParameterField, remove: removeParameterField } = useFieldArray({
        name: "parameters",
        control: form.control,
    })
    console.log(form.formState.errors)
    console.log(form.getValues())
    async function onsubmitHandler(values: FormValues) {
        const mode = state.mode;
        if (mode === 'CREATE_NEW_ENDPOINT') {
            if (state.createdCopilot) {
                const response = await createActionByBotId(state.createdCopilot.id, values);
                if (response.status === 200) {
                    toast({
                        title: "Action created",
                        description: "New action has been created.",
                        variant: "success"
                    })
                    revalidateActions(state.createdCopilot.id)
                }
            }
            form.reset()
        } else if (mode === 'EDIT_EXISTING_ENDPOINT' && defaultValues) {
            console.log("Edit existing endpoint", defaultValues.id)
            const index = state.swaggerEndpoints.findIndex((endpoint) => endpoint.id === defaultValues.id);
            const newEndpoints = _.cloneDeep(state.swaggerEndpoints);
            newEndpoints[index] = { ...values, id: defaultValues.id };
            dispatch({
                type: "SET_SWAGGER_ENDPOINTS",
                payload: newEndpoints
            })
            toast({
                title: "Endpoint updated",
                description: `Endpoint ${values.name} has been updated.`,
                variant: "success"
            })
        }

    }

    return (
        <AlertDialog open={true}>
            <AlertDialogContent asChild className="overflow-auto">
                <form onSubmit={form.handleSubmit(onsubmitHandler)}>
                    <AlertDialogHeader className="flex items-center justify-between w-full flex-row">
                        <AlertDialogTitle className="flex-1">
                            Define API action
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="w-full space-y-4 flex-1">
                        <Input placeholder="Title, for example (Create a new post)" {...form.register('name')} />
                        <div className="w-full">
                            <div data-invalid={form.getFieldState('api_endpoint').invalid || form.getFieldState('request_type').invalid} className="flex items-center data-[invalid='true']:!border-destructive h-12 gap-0.5 p-1 overflow-hidden border border-border w-full m-0 bg-white shadow-sm rounded-md focus:outline-none text-sm focus-visible:outline-none transition-colors">
                                <Select {..._.omit(form.register("request_type"), ['ref', "onChange"])} onValueChange={(v) => {
                                    form.register("request_type").onChange({
                                        type: "change",
                                        target: {
                                            value: v,
                                            name: "request_type"
                                        }
                                    });
                                }}>
                                    <SelectTrigger {..._.pick(form.register("request_type"), ['ref'])} className="ring-0 w-fit h-full p-1.5 border-0 text-xs font-semibold">
                                        <SelectValue placeholder="Method" />
                                    </SelectTrigger>
                                    <SelectContent className="max-w-fit">
                                        {
                                            apiMethods.map((method) => (
                                                <SelectItem key={method} value={method} className="py-1.5">
                                                    {method}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                                <Input className="flex-1 border-0 h-full py-1.5 shadow-none" {...form.register('api_endpoint')} placeholder="API endpoint" />
                            </div>
                            <p className="text-xs text-destructive mt-1">{form.getFieldState('api_endpoint').error?.message}</p>
                        </div>

                        <div>
                            <div className="w-full relative">
                                <Textarea {...form.register('description')} maxRows={5} placeholder="Summary, make sure it's celar and easy to understand" minRows={2} />
                                <span className="absolute -top-2 -right-2 bg-white px-1.5 py-0.5 text-xs rounded-md text-muted-foreground">
                                    {form.watch('description')?.length || 0}/50
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Consider adding a description to help the copilot understand the purpose of this API.
                            </p>
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
                                ><Plus className="w-4 h-4" /></Button>
                            </div>
                            <div className="space-y-3" data-container='headers'>

                                {
                                    headerFields.map((field, index) => {
                                        const errorMessage = form.formState.errors.headers?.[index]?.value?.message;
                                        const isValid = errorMessage === undefined;
                                        return (<div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1" key={field.id}>
                                            <Input placeholder="Key"
                                                {...form.register(`headers.${index}.key`)}
                                                data-valid={isValid}
                                            />
                                            <Input placeholder="Value"
                                                data-valid={isValid}
                                                {...form.register(`headers.${index}.value`)}
                                            />
                                            <button className="shrink-0 p-2 text-destructive" type="button"
                                                onClick={() => removeHeaderField(index)}>
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>)
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
                        <div className="space-y-2">
                            <Label htmlFor="request-body" >
                                Body (JSON Schema only)
                            </Label>
                            <Textarea id="request-body" {...form.register('body')} placeholder="Request Body" minRows={4} />
                        </div>
                        <AlertDialogFooter className="gap-2 sticky bottom-0 left-0 bg-white w-full">
                            <AlertDialogCancel onClick={() => dispatch({
                                type: "CHANGE_MODE",
                                payload: {
                                    mode: undefined,
                                    endpointId: undefined
                                }
                            })}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction type="submit">
                                Save
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </div>
                </form>
            </AlertDialogContent >
        </AlertDialog >
    )
}