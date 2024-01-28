import { HeaderShell } from '@/components/domain/HeaderShell'
import { SimpleCard } from '@/components/domain/simple-card'
import { Stack } from '@/components/ui/Stack'
import React from 'react'
import { SimpleAnalyticsCards } from './AnalyticsCards';
import { AnalyticsActions } from './AnalyticsActions'

type Props = {
    params: {
        copilot_id: string
    }
}

export default function AnalyticsPage(props: Props) {

    return (
        <Stack direction='column' fluid className='h-full'>
            <HeaderShell>
                <h1 className="text-lg font-bold text-secondary-foreground">
                    Analytics
                </h1>
            </HeaderShell>
            <main className='flex-1 overflow-auto p-4 w-full flex flex-col gap-4'>
                <SimpleAnalyticsCards copilot_id={props.params.copilot_id} />
                <div className='flex-1 w-full rounded-md grid grid-cols-2 overflow-hidden gap-5'>
                    <AnalyticsActions copilot_id={props.params.copilot_id} />
                </div>
            </main>
        </Stack>
    )
}
