'use client';
import { EmptyBlock } from '@/components/domain/EmptyBlock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils';
import _ from 'lodash';
import { MinusCircle, PlusCircle } from 'lucide-react';
import React from 'react'

// each row should have a name, value, and description
type Variable = {
    name: string,
    value: string,
    description: string,
    new?: boolean,
}
function getFieldsFromFormData(formData: FormData): Variable[] {
    const data = Object.fromEntries(formData.entries())
    const fields: Variable[] = []
    _.forEach(data, (value, key) => {
        const [field, index, name] = key.split('-')
        if (field === 'field') {
            if (fields[Number(index)] === undefined) {
                fields[Number(index)] = {
                    name: '',
                    value: '',
                    description: '',
                }
            }
            if (field && index && name) {
                _.assign(fields[Number(index)], {
                    [name]: value
                })
            }
        }
    })
    return fields
}
export function VariablesForm() {
    const [fields, setFields] = React.useState<Variable[]>([]);

    function handleAppendField() {
        setFields([...fields, {
            name: '',
            value: '',
            description: '',
            new: true,
        }])
    }

    function handleRemoveField(index: number) {
        setFields(fields.filter((_, i) => i !== index))
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        // get the fields from the form data
        const fields = getFieldsFromFormData(formData)
        console.log(fields)
    }
    return (
        <form action="" className='contents' onSubmit={handleSubmit}>
            {
                _.isEmpty(fields) ? <div>
                    <EmptyBlock>
                        <p>
                            You don't have any variables yet. Click the button below to add one.
                        </p>
                    </EmptyBlock>
                </div> : <div className='row flex flex-col items-start w-full gap-4'>
                    {
                        fields.map((field, i) => {
                            const field_ = `field-${i}-`;
                            const fieldId = `field-${i}_id_`;
                            const isLast = fields.length === 1;
                            return (
                                <div key={i} className={cn('flex items-start w-full px-5 py-2 first:pt-5 gap-2', field.new && "blink")}>
                                    <div className='grid grid-cols-2 grid-rows-2 gap-2 w-full'>
                                        <div className='col-span-1'>
                                            <label htmlFor={fieldId + "key"} className='text-xs font-medium'>Key</label>
                                            <Input type="text" id={fieldId + "key"} defaultValue={field.name} required placeholder='Key' name={field_ + "name"} />
                                        </div>
                                        <div className='col-span-1'>
                                            <label htmlFor={fieldId + "value"} className='text-xs font-medium'>Value</label>
                                            <Input type="text" id={fieldId + "value"} defaultValue={field.value} required placeholder='Value' name={field_ + "value"} />
                                        </div>
                                        <div className='col-span-2'>
                                            <label htmlFor={fieldId + "description"} className='text-xs font-medium'>Description</label>
                                            <Input type="text" id={fieldId + "description"} defaultValue={field.description} name={field_ + "description"} />
                                        </div>
                                    </div>
                                    <div className='mt-6 flex-center gap-2 *:shrink-0'>
                                        <Button variant='destructive' size='icon' disabled={isLast} onClick={() => handleRemoveField(i)}>
                                            <MinusCircle size={20} />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            }

            <div className='mt-4 pt-4 border-t space-x-2 p-5'>
                <Button type='submit' variant='default'>Save</Button>
                <Button variant='secondary' onClick={handleAppendField}>Add <PlusCircle size={20} className='ms-1' /></Button>
            </div>
        </form>
    )
}
