'use client';
import { Stack } from '@/components/ui/Stack'
import React from 'react'
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Aside } from './Aside'


export default function ActionsLayout({ children }: { children: React.ReactNode }) {
    return (
        <Stack direction='column' fluid className='h-full'>
            <div className='flex-1 w-full'>
                <ResizablePanelGroup direction="horizontal" className='h-full'>
                    <Aside />
                    <ResizablePanel>
                        {children}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </Stack>
    )
}