'use client';
import { useListActions } from '@/hooks/useActions';
import React, { useState } from 'react'
import { useCopilot } from '../../../_context/CopilotProvider';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { HeaderShell } from '@/components/domain/HeaderShell'
import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable';
import { Stack } from '@/components/ui/Stack';
import { Input } from '@/components/ui/input';
import { Method } from '@/components/domain/MethodRenderer';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ACTIVE_ACTION_KEY } from './utils';
import { cn } from '@/lib/utils';
import { H3 } from '@/components/ui/Typography';


function ActionItem({ action }: { action: any }) {
    const sp = useSearchParams()
    const pathname = usePathname()
    const href = `${pathname}?${ACTIVE_ACTION_KEY}=${action.id}`
    const activeAction = sp.get(ACTIVE_ACTION_KEY)
    const isActive = activeAction === action.id
    return (
        <Link href={href} title={action.name} className='contents'>
            <Stack className={cn('p-2 rounded-md overflow-hidden', isActive ? 'bg-secondary text-primary' : 'hover:bg-secondary')} gap={10} fluid>
                <Method method={action.request_type} size='tiny'>
                    {action.request_type}
                </Method>
                <h3 className='flex-1 text-sm font-medium line-clamp-1'>{action.name}</h3>
            </Stack>
        </Link>
    )
}

export function Aside() {
    const { id: copilotId } = useCopilot()
    const { data } = useListActions(copilotId)
    const [isDragging, setIsDragging] = useState(false);

    return <> <ResizablePanel defaultSize={25} maxSize={25} data-dragging={isDragging} collapsible className='data-[dragging="true"]:opacity-50'>
        <Stack direction='column' fluid className='h-full'>
            <HeaderShell className='justify-between px-3'>
                <H3 className='text-lg font-bold'>Actions</H3>
                <div className='space-y-2'>
                    <Button variant='default' size='fit' asChild>
                        <Link href={`/copilot/${copilotId}/actionss`}>
                            <Plus className='size-5' />
                        </Link>
                    </Button>
                </div>
            </HeaderShell>
            <div className='w-full px-3 animate-in fade-in py-2 border-b'>
                <Input placeholder='Search....' list='items' />
                <datalist id='items'>
                    {
                        data?.map(action => <option key={action.id} value={action.name} />)
                    }
                </datalist>
            </div>
            <div className='flex-1 no-scrollbar p-2 w-full overflow-y-auto overflow-hidden'>
                {data?.map(action => <ActionItem key={action.id} action={action} />)}
            </div>
        </Stack>
    </ResizablePanel>
        <ResizableHandle withHandle onDragging={setIsDragging} />
    </>
}
