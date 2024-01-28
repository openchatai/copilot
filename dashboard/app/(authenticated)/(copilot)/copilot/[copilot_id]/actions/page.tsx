'use client';
import { HeaderShell } from '@/components/domain/HeaderShell'
import { Zap } from 'lucide-react';
import { ActionsDataGrid } from './ActionsDataGrid';
import { Suspense } from 'react';
import { Stack } from '@/components/ui/Stack';
import { Button } from '@/components/ui/button';
import { AddActionDrawer, useActionFormState } from '@/components/domain/new-flows-editor/addActionDrawer';
import { SwaggerUpload } from './SwaggerUpload';

type Props = {
    params: {
        copilot_id: string;
    }
}

export default function ActionsPage({ params }: Props) {
    const [
        ,
        setActionFormState
    ] = useActionFormState();
    return (
        <Stack
            ic='center'
            direction='column'
            fluid
            className='size-full'>
            <HeaderShell className='justify-between'>
                <div className='flex items-center gap-2'>
                    <Zap size={24} />
                    <h1 className='text-lg font-semibold'>Actions</h1>
                </div>
                <div className='space-x-2'>
                    <Button onClick={() => setActionFormState(true)} variant='default'>Create</Button>
                    <SwaggerUpload copilotId={params.copilot_id}/>
                </div>
            </HeaderShell>
            <AddActionDrawer />
            <div className='flex-1 w-full p-4 overflow-auto'>
                <Suspense fallback={<div>Loading...</div>}>
                    <ActionsDataGrid copilot_id={params.copilot_id} />
                </Suspense>
            </div>
        </Stack>
    )
}