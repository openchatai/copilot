import { HeaderShell } from '@/components/domain/HeaderShell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { Workflow } from 'lucide-react'
import React from 'react'
import CreateWorkflowForm from './CreateWorkflowForm'
import WorkflowsTable from './WorkflowsTable'

type Props = {
    params: {
        copilot_id: string;
    }
}

export default function ListWorkflows({ params }: Props) {
    const baseUrl = `/copilot/${params.copilot_id}/workflow`;
    return (
        <div>
            <HeaderShell className='justify-between'>
                <div className='flex items-center gap-2'>
                    <Workflow size={24} />
                    <h1 className='text-lg font-semibold'>Flows</h1>
                </div>
                <div>
                    <CreateWorkflowForm />
                </div>
            </HeaderShell>
            <div className='p-4'>
                <Alert variant='info' className='text-start mb-2'>
                    <AlertTitle>What are flows?</AlertTitle>
                    <AlertDescription>
                        Flows are a sequence of actions that are executed when they meet certain conditions within the conversation with the copilots
                    </AlertDescription>
                </Alert>
                <WorkflowsTable />
            </div>
        </div>
    )
}
