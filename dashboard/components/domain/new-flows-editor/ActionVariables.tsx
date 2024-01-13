import { Field, Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetClose, SheetFooter } from "@/components/ui/sheet";
import { useController } from './Controller';
import { FieldArray } from '@/components/ui/FieldArray';
import { Textarea } from '@/components/ui/textarea';
import { PayloadType } from '@/data/actions';
import { uniqueId } from 'lodash';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/SelectField';

// if fillType is static, then value is required

const variablesSchema = z.object({
    parameters: z.array(z.object({
        name: z.string().readonly(),
        required: z.boolean().readonly(),
        value: z.string().optional(),
        type: z.enum(['string', 'integer', 'boolean', 'object', 'array']).readonly(),
        id: z.string().readonly(),
        fillType: z.enum(['static', 'magic', 'path']).default('magic'),
    }).optional()).optional(),
    request_body: z.string().optional(),
});
export type VariablesType = z.infer<typeof variablesSchema>;

const noop = () => { };

type Props = {
    variables?: VariablesType;
    onSubmit?: SubmitHandler<VariablesType>;
    onChange?: (data: VariablesType) => void;
    footer?: (form: ReturnType<typeof useForm<VariablesType>>) => React.ReactNode
}
export function ActionVariablesForm({
    onSubmit,
    footer,
    variables
}: Props) {
    const form = useForm({
        resolver: zodResolver(variablesSchema),
        defaultValues: variables,
        mode: "all"
    });
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit ?? noop)} className='contents'>
                <FieldArray control={form.control} name='parameters' render={(fields) => {
                    return fields.fields.map((field, index) => {
                        const isRequired = fields?.fields?.[index]?.required;
                        const type = fields?.fields?.[index]?.type;
                        const fillType = form.getValues(`parameters.${index}.fillType`);

                        return <div key={field.id} className='space-y-2'>
                            <Field name={`parameters.${index}.name`} label='Name' required={isRequired} control={form.control} render={(field) => {
                                return <Input {...field} disabled />
                            }} />
                            <div className='flex gap-2 w-full'>
                                <div className='relative flex-1 w-fit'>
                                    <div className='absolute h-full flex-center w-fit right-1.5'>
                                        <span className='text-xs rounded bg-blue-500 text-white py-1 px-2'>
                                            {type}
                                        </span>
                                    </div>
                                    <input
                                        placeholder='Value'
                                        disabled={fillType === 'magic'}
                                        className='reset-input pr-20 w-full'
                                        {...form.register(`parameters.${index}.value`)}
                                        {...field}
                                    />
                                </div>
                                <Field
                                    name={`parameters.${index}.fillType`}
                                    control={form.control}
                                    className='space-y-0'
                                    render={(field) => {
                                        return <SelectField
                                            options={[{
                                                label: 'Static',
                                                value: 'static'
                                            }, {
                                                label: 'Magic',
                                                value: 'magic'
                                            }, {
                                                label: 'Path',
                                                value: 'path'
                                            }]}
                                            {...field}
                                        />
                                    }} />
                            </div>
                        </div>
                    })
                }} />
                <Field name='request_body' label='Request Body' control={form.control} render={(field) => {
                    return <Textarea minRows={4} maxRows={6} {...field} />
                }} />
                {footer?.(form)}
            </form>
        </Form >
    )
}

function payloadToVariables(payload: PayloadType): VariablesType {
    const vars: VariablesType['parameters'] = []
    payload.parameters.forEach((param) => {
        vars.push({
            name: param.name,
            value: undefined,
            required: param.required,
            type: param.schema.type as any,
            fillType: 'magic',
            id: uniqueId('param_')
        })
    })
    return {
        parameters: vars,
        request_body: JSON.stringify(payload.request_body) ?? '',
    }
}
export function ActionVariablesDrawer() {
    const { selectedActions } = useController();
    const action = useMemo(() => selectedActions.getSelectedActionData(), [selectedActions]);
    // const actionVars = useMemo(() => action?.payload && payloadToVariables(action.payload), [action]);
    return (
        <Sheet
            open={selectedActions.isSelected()}
            onOpenChange={(op) => {
                if (!op) {
                    selectedActions.unselectAction();
                }
            }}>
            <SheetContent className="overflow-auto pb-0">
                <SheetHeader className="border-b pb-2 w-full">
                    <SheetTitle className='text-balance whitespace-normal'>
                        Set Variables for Action
                    </SheetTitle>
                    <SheetDescription className='font-semibold'>
                        {action?.name}
                    </SheetDescription>
                </SheetHeader>
                <div className='space-y-2 py-4 px-2'>
                    <ActionVariablesForm
                        onSubmit={(da) => {
                            console.log(da);
                        }}
                        // variables={actionVars}
                        footer={
                            (form) => (
                                <SheetFooter className="sticky w-full py-3 bg-white bottom-0 inset-x-0">
                                    <Button disabled={!form.formState.isValid} type="submit">Submit</Button>
                                    <SheetClose asChild>
                                        <Button variant='ghost'>Cancel</Button>
                                    </SheetClose>
                                </SheetFooter>
                            )
                        } />
                </div>

            </SheetContent>
        </Sheet>

    )
}
