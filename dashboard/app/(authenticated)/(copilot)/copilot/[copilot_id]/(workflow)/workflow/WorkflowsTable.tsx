'use client';
import React from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link } from '@/lib/router-events'
import useSWR, { mutate } from 'swr';
import { getFlowsByBotId } from '@/data/new_flows';
import _ from 'lodash';
import { EmptyBlock } from '@/components/domain/EmptyBlock';
import { useCopilot } from '../../../CopilotProvider';
export const revalidateWorkflows = (copilot_id: string) => mutate(copilot_id + '/workflows')

function WorkflowsTable() {
    const { id: copilotId } = useCopilot();
    const baseUrl = `/copilot/${copilotId}/workflow`;
    const { data: flows } = useSWR(copilotId + '/workflows', async () => (await getFlowsByBotId(copilotId)).data)
    return (
        <Table className='caption-top text-sm' wrapperClassName='rounded-lg'>
            <TableHeader>
                <TableRow>
                    <TableHead className='px-8'>Name</TableHead>
                    <TableHead className='px-8'>Description</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {_.isEmpty(flows) ? <TableRow>
                    <TableCell colSpan={2}>
                        <EmptyBlock />
                    </TableCell>
                </TableRow> : flows?.map((flow, index) => {
                    return <TableRow className='bg-white' key={index}>
                        <TableCell className='px-8'>
                            <Button variant='link' className='text-left' asChild size='fit'>
                                <Link href={`${baseUrl}/${flow.flow_id}`}>
                                    {flow.name}
                                </Link>
                            </Button>
                        </TableCell>
                        <TableCell className='px-8'>{flow.description}</TableCell>
                    </TableRow>
                })}

            </TableBody>
        </Table>
    )
}

export default WorkflowsTable