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
import { toast } from "@/components/ui/use-toast";
import { atom, useAtom } from "jotai";
import axios, { AxiosResponse } from "axios";

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

const testAtom = atom<{
    endpointId: string;
    response: AxiosResponse<any>;
    isOk: boolean;
}[]>([])

const isTestingAtom = atom(false);

export function SwaggerForm({ defaultValues }: { defaultValues?: FormValuesWithId }) {
    const { state, dispatch } = useCreateCopilot();
    const currentlyEditingEndpointId = state.currentlyEditingEndpointId;
    const { register, handleSubmit, ...form } = useForm<FormValues>({
        resolver: zodResolver(swaggerFormSchema),
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
    const [testResults, setTestResults] = useAtom(testAtom);
    const [testing, setTesting] = useAtom(isTestingAtom);
    
    async function onsubmitHandler(values: FormValues) {
        const mode = state.mode;
        if (mode === 'CREATE_NEW_ENDPOINT') {
            console.log("Creaet new endpoint", values)
            dispatch({
                type: "ADD_NEW_ENDPOINT",
                payload: { ...values, id: _.uniqueId() }
            })
            toast({
                title: "Endpoint added",
                description: "Endpoint has been added to the list.",
                variant: "success"
            })
            form.reset()
            dispatch({
                type: "CHANGE_MODE",
                payload: {
                    mode: undefined,
                    endpointId: undefined
                }
            })
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
                description: `Endpoint ${values.title} has been updated.`,
                variant: "success"
            })
        }

    }
    
    async function testEndpoint() {
        try {
            if (!form.formState.isValid) {
                toast({
                    title: "Invalid form",
                    description: "Please fix the errors in the form.",
                    variant: "destructive"
                })
                return;
            } else if (!currentlyEditingEndpointId) {
                toast({
                    title: "You should save the endpoint first",
                    description: "You should save the endpoint first",
                    variant: "destructive"
                })
            } else {
                setTesting(true);
                const request = await axios.request({
                    method: form.watch('method'),
                    url: form.watch('url'),
                    data: form.watch('body'),
                    headers: _.fromPairs(headerFields.map((field) => [field.key, field.value])),
                    params: _.fromPairs(parameterFields.map((field) => [field.key, field.value])),
                })
                setTestResults((prev) => [...prev, {
                    endpointId: currentlyEditingEndpointId,
                    response: request,
                    isOk: request.status >= 200 && request.status < 300
                }])
                setTesting(false);
            }
        } catch (error) {
            setTesting(true);
        }

    }
    
    return (
        <AlertDialog open={!!state.mode}>
            <AlertDialogContent asChild className="overflow-auto">
                <form onSubmit={handleSubmit(onsubmitHandler)}>
                    <AlertDialogHeader className="flex items-center justify-between w-full flex-row">
                        <AlertDialogTitle className="flex-1">
                            API
                        </AlertDialogTitle>
                        <Button variant="success" size="sm" type="button" onClick={testEndpoint} loading={testing} disabled={testing}>
                            <Play className="w-5 h-5" />
                            Test
                        </Button>
                    </AlertDialogHeader>
                    <div className="w-full space-y-4 flex-1">
                        <Input placeholder="Title" data-invalid={form.getFieldState('title').invalid}  {...register('title')} />
                        <div className="w-full">
                            <div data-invalid={form.getFieldState('url').invalid || form.getFieldState('method').invalid} className="flex items-center data-[invalid='true']:!border-destructive h-12 gap-0.5 p-1 overflow-hidden border border-border w-full m-0 bg-white shadow-sm rounded-md focus:outline-none text-sm focus-visible:outline-none transition-colors">
                                <FormSelect value={form.watch('method')} {...register('method')}>
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
                                <Input className="flex-1 border-0 h-full py-1.5 shadow-none" {...register('url')} placeholder="API endpoint" />
                            </div>
                            <p className="text-xs text-destructive mt-1">{form.getFieldState('url').error?.message}</p>
                        </div>

                        <div>
                            <div className="w-full relative">
                                <Textarea {...register('summary')} maxRows={5} data-invalid={form.getFieldState('summary').invalid} placeholder="Summary" minRows={2} />
                                <span className="absolute -top-2 -right-2 bg-white px-1.5 py-0.5 text-xs rounded-md text-muted-foreground">
                                    {form.watch('summary')?.length || 0}/50
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
                                                {...register(`headers.${index}.key`)}
                                                data-valid={isValid}
                                            />
                                            <Input placeholder="Value"
                                                data-valid={isValid}
                                                {...register(`headers.${index}.value`)}
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
                                                {...register(`parameters.${index}.key`)}
                                                data-valid={isValid}
                                            />
                                            <Input placeholder="Value"
                                                data-valid={isValid}
                                                {...register(`parameters.${index}.value`)}
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
                                Body
                            </Label>
                            <Textarea id="request-body" {...register('body')} placeholder="Request Body" minRows={4} />
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