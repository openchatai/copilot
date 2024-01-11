import { HeaderShell } from '@/components/domain/HeaderShell'
import { RouteIcon } from 'lucide-react';
import { ActionsDataGrid } from './ActionsDataGrid';
import { Suspense } from 'react';
import { Stack } from '@/components/ui/Stack';

type Props = {
    params: {
        copilot_id: string;
    }
}

export default function ActionsPage({ params }: Props) {
    return (
        <Stack 
        ic='center'
        direction='column'
        fluid
        className='size-full'>
            <HeaderShell className='justify-between'>
                <div className='flex items-center gap-2'>
                    <RouteIcon size={24} />
                    <h1 className='text-lg font-semibold'>Flows</h1>
                </div>
            </HeaderShell>
            <div className='flex-1 w-full p-4 overflow-auto'>
                <Suspense fallback={<div>Loading...</div>}>
                    <ActionsDataGrid copilot_id={params.copilot_id} />
                </Suspense>
            </div>
        </Stack>
    )
}