import { HeaderShell } from '@/components/domain/HeaderShell'
import { FlowsControllerV2 } from '@/components/domain/new-flows-editor/Controller'
import { Button } from '@/components/ui/button'
import React from 'react'

type Props = {
    children: React.ReactNode
}

function WorkflowLayout({
    children
}: Props) {
    return (
        <FlowsControllerV2>
            <div className='h-full flex flex-col'>
                <HeaderShell className='justify-between'>
                    <h2 className='text-lg font-semibold'>Edit Workflow</h2>
                    <div className='space-x-2'>
                        <Button>
                            Save
                        </Button>
                        <Button variant='destructive'>
                            Delete
                        </Button>
                    </div>
                </HeaderShell>
                <div className='flex-1 min-h-0'>
                    {children}
                </div>
            </div>
        </FlowsControllerV2>

    )
}

export default WorkflowLayout