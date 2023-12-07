import { HeaderShell } from '@/components/domain/HeaderShell'
import { Button } from '@/components/ui/button'
import React from 'react'

type Props = {
    children: React.ReactNode
}

function WorkflowLayout({
    children
}: Props) {
    return (
        <div className='h-full flex flex-col'>
            <HeaderShell className='justify-between'>
                <h2>Workflow</h2>
                <Button>
                    Save
                </Button>
            </HeaderShell>
            <div className='flex-1'>
                {children}
            </div>
        </div>
    )
}

export default WorkflowLayout