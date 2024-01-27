'use client';
import { HeaderShell } from '@/components/domain/HeaderShell';
import { Stack } from '@/components/ui/Stack';
import React from 'react'
import { ACTIVE_ACTION_KEY } from './utils';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import './styles.css';
import { ActionForm } from './ActionForm';


export default function ActionsPage() {
    const sp = useSearchParams()
    const activeAction = sp.get(ACTIVE_ACTION_KEY)
    return (
        <Stack className='h-full' fluid direction='column'>
            <HeaderShell className='justify-between'>
                <h2>{activeAction}</h2>
                <div>
                    <Button>Save</Button>
                </div>
            </HeaderShell>
            <main className='w-full'>
                <ActionForm />
            </main>
        </Stack>
    )
}
