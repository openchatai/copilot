'use client';
import { HeaderShell } from '@/components/domain/HeaderShell';
import { Stack } from '@/components/ui/Stack';
import React from 'react'
import { ACTIVE_ACTION_KEY } from './utils';
import { useSearchParams } from 'next/navigation';

export default function ActionsPage() {
    const sp = useSearchParams()
    const activeAction = sp.get(ACTIVE_ACTION_KEY)
    if (activeAction) {
        return (
            <Stack className='h-full' fluid direction='column'>
                <HeaderShell></HeaderShell>
                <main>
                    You are going to edit this action
                </main>
            </Stack>
        )
    }

    return (
        <Stack className='h-full' fluid direction='column'>
            <HeaderShell></HeaderShell>
            <main>
                you are going to create a new action
            </main>
        </Stack>
    )
}
