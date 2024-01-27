import React from 'react'
import { H5 } from '@/components/ui/Typography';
import { Plus, Trash, Wand2 } from 'lucide-react';
import { Confirm } from '@/components/ui/Confirm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ParametersField() {
    return (
        <table className='w-full'>
            <thead>
                <tr className='*:py-2'>
                    <th className='text-left'>
                        <H5>
                            Parameters
                        </H5>
                    </th>
                    <th>

                    </th>
                    <th className='text-right'>
                        <Button size='fit' variant='outline'>
                            <Plus className='size-3' />
                        </Button>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <Input />
                    </td>
                    <td>
                        <Input />
                    </td>
                    <th className='space-x-2 text-end'>
                        <Button variant='success' size='fit'>
                            <Wand2 className='size-4' />
                        </Button>
                        <Confirm
                            variant='destructive'
                            description='Are you sure you want to delete this parameter?'
                            title='Delete Parameter'
                        >
                            <Button variant='destructive' size='fit'>
                                <Trash className='size-4' />
                            </Button>
                        </Confirm>

                    </th>
                </tr>
            </tbody>
        </table>
    )
}

export default ParametersField