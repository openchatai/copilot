'use client'
import { HeaderShell } from '@/components/domain/HeaderShell'
import { FlowsControllerV2, useController } from '@/components/domain/new-flows-editor/Controller'
import { Button } from '@/components/ui/button'
import React from 'react'
import { useAsyncFn } from 'react-use'
import { syncWorkflowById as $syncWorkflowById, getFlowById } from '@/data/new_flows'
import useSWR from 'swr'
import { getActionsByBotId } from '@/data/actions'
import _, { uniqueId } from 'lodash'
import { toast } from 'sonner'
import { useCopilot } from '../../../../CopilotProvider'

type Props = {
    children: React.ReactNode;
    params: {
        copilot_id: string;
        workflow_id: string;
    }
}
function Header({ workflow_id }: { workflow_id: string }) {
    const { state, dispatch } = useController();
    const { id: copilotId } = useCopilot();
    const [$state, syncWorkflowById] = useAsyncFn($syncWorkflowById);
    const $isLoading = $state.loading;

    const { mutate: mutateFlow } = useSWR(copilotId + '/flow/' + workflow_id, async () => ((await getFlowById(workflow_id)).data), {
        onSuccess(data) {
            dispatch({
                type: "SET_WORKFLOW_DATA", payload: {
                    name: data.name,
                    description: data.description,
                    flow_id: data.flow_id,
                    blocks: data.blocks.map((block) => {
                        return {
                            ...block,
                            id: block.id || uniqueId("block_")
                        }
                    })
                }
            })
        },
    });

    useSWR(copilotId + "/actions", async () => (await getActionsByBotId(copilotId)).data, {
        onSuccess: (data) => {
            dispatch({ type: "LOAD_ACTIONS", payload: data })
        }
    });

    return <>

        <HeaderShell className='justify-between'>
            <div className=''>
                <h2 className='text-lg font-semibold'>{state.name}</h2>
                <p className='text-xs'>
                    {state.description}
                </p>
            </div>
            <div className='space-x-2'>
                <Button onClick={async () => {
                    if (state.flow_id) {
                        const response = await syncWorkflowById(state.flow_id, {
                            blocks: state.blocks,
                            name: state.name!,
                            description: state.description!
                        })
                        if (response.data) {
                            toast.success("Flow saved successfully")
                            _.delay(mutateFlow, 1000)
                        }
                    }
                }}
                    disabled={$isLoading}>
                    {
                        $isLoading ? 'Saving...' : 'Save'
                    }
                </Button>
            </div>
        </HeaderShell>
    </>

}
function WorkflowLayout({
    children,
    params
}: Props) {
    return (
        <FlowsControllerV2>
            <div className='h-full flex flex-col'>
                <Header workflow_id={params.workflow_id} />
                <div className='flex-1 min-h-0'>
                    {children}
                </div>
            </div>
        </FlowsControllerV2>

    )
}

export default WorkflowLayout