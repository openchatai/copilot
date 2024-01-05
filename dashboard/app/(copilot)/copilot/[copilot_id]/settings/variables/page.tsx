'use client';
import { HeaderShell } from '@/components/domain/HeaderShell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import React from 'react'
import { AddSingleVariable } from './SingleVariableForm'
import { useVariables } from './useVariables';

type Props = {
    params: {
        copilot_id: string
    }
}

export default function GlobalVariablesPage(props: Props) {
    const { data } = useVariables(props.params.copilot_id);
    console.log(data)
    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            <HeaderShell className="items-center justify-between">
                <h1 className="text-lg font-bold text-secondary-foreground">Global Variables</h1>
                <div>
                    <AddSingleVariable />
                </div>
            </HeaderShell>
            <div className='flex-1 px-4 py-4 w-full overflow-auto'>
                <Alert variant='info'>
                    <AlertTitle>What are global variables</AlertTitle>
                    <AlertDescription>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore, molestiae! Tenetur culpa corrupti fugit eligendi repellat at, atque, eum eveniet eius rem, enim officia voluptates facilis corporis similique nulla aliquid.
                    </AlertDescription>
                </Alert>
                <div className='border bg-white max-w-screen-lg rounded-lg mt-5 w-full'>

                </div>
            </div>
        </div>
    )
}