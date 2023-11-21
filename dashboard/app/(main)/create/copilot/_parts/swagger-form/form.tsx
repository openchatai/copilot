import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, forwardRef } from "react";
import { useForm, useFieldArray, UseFormRegisterReturn } from "react-hook-form";
import {
    Select,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Play, Plus, X } from "lucide-react";
import _ from "lodash";
import { FormValues, FormValuesWithId, methods, swaggerFormSchema } from "./types";
import { useCreateCopilot } from "../CreateCopilotProvider";

interface FormSelectProps extends UseFormRegisterReturn {
    children?: ReactNode;
    triggerContent?: ReactNode;
    value?: string;
}

const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(({ name, onChange, required, disabled, children, value }, ref) => {
    return <Select
        name={name}
        onValueChange={(value) => onChange({ target: { name, value } })}
        required={required}
        disabled={disabled}
        value={value}
    >
        {children}
    </Select>
})

FormSelect.displayName = "FormSelect";

export function SwaggerForm({ defaultValues }: { defaultValues: FormValuesWithId }) {
    const { state, dispatch } = useCreateCopilot();
    const currentlyEditingEndpointId = state.currentlyEditingEndpointId;
    const form = useForm<FormValues>({
        mode: "onBlur",
        resolver: zodResolver(swaggerFormSchema),
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

    async function onsubmitHandler(values: FormValues) {
        if (currentlyEditingEndpointId) {
            // not save but update
            const index = state.swaggerEndpoints.findIndex((endpoint) => endpoint.id === currentlyEditingEndpointId);
            const newEndpoints = _.cloneDeep(state.swaggerEndpoints);
            newEndpoints[index] = { ...values, id: currentlyEditingEndpointId };
            dispatch({
                type: "SET_SWAGGER_ENDPOINTS",
                payload: newEndpoints
            })
        }
        dispatch({
            type: "SET_CURRENTLY_EDITING_ENDPOINT_ID",
            payload: null
        })
    }

    return (
        <AlertDialog open={!!currentlyEditingEndpointId}>
            <AlertDialogContent asChild>
                <form onSubmit={form.handleSubmit(onsubmitHandler)}>
                    <AlertDialogHeader className="flex items-center justify-between w-full flex-row">
                        <AlertDialogTitle className="flex-1">
                            API
                        </AlertDialogTitle>
                        <Button variant="success" size="sm" type="button">
                            <Play className="w-5 h-5" />
                            Test
                        </Button>
                    </AlertDialogHeader>
                    <div className="w-full space-y-4">
                        <Input placeholder="Title" {...form.register('title')} data-valid={!form.getFieldState('title').invalid} />
                        <div className="w-full">
                            <div className="flex items-center h-12 gap-0.5 p-1 focus-within:!border-primary overflow-hidden border border-border w-full m-0 bg-white shadow-sm rounded-md focus:outline-none text-sm focus-visible:outline-none focus-visible:border-primary transition-colors">
                                <FormSelect value={form.watch('method')} {...form.register('method')}>
                                    <SelectTrigger className="ring-0 w-fit h-full p-1.5 border-0 text-xs font-semibold">
                                        <SelectValue placeholder="Method" />
                                    </SelectTrigger>
                                    <SelectContent className="max-w-fit">
                                        {
                                            methods.map((method) => (
                                                <SelectItem key={method} value={method} className="py-1.5">
                                                    {method}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </FormSelect>
                                <Input className="flex-1 border-0 h-full py-1.5 shadow-none" {...form.register('url')} placeholder="API endpoint" />
                            </div>
                            <p className="text-xs text-destructive mt-1">{form.getFieldState('url').error?.message}</p>
                        </div>

                        <div>
                            <Textarea {...form.register('summary')} placeholder="summary" minRows={3} />
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

                        <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel onClick={() => dispatch({
                                type: "SET_CURRENTLY_EDITING_ENDPOINT_ID",
                                payload: null
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