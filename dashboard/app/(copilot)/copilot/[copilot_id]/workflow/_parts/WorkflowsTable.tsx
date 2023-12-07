'use client';
import React from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link } from '@/lib/router-events'
import { useCopilot } from '../../../_context/CopilotProvider';

function WorkflowsTable() {
    const { id: copilotId } = useCopilot();
    const baseUrl = `/copilot/${copilotId}/workflow`;
    return (
        <Table className='caption-top text-sm' wrapperClassName='rounded-lg'>
            <TableHeader>
                <TableRow>
                    <TableHead className='px-8'>Name</TableHead>
                    <TableHead className='px-8'>Status</TableHead>
                    <TableHead className='px-8'>Created</TableHead>
                    <TableHead className='px-8'>Updated</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow className='bg-white'>
                    <TableCell className='px-8'>
                        <Button variant='link' className='text-left' asChild size='fit'>
                            <Link href={`${baseUrl}/first_flow_id`}>
                                Flow 1
                            </Link>
                        </Button>
                    </TableCell>
                    <TableCell className='px-8'>active</TableCell>
                    <TableCell className='px-8'>2 days ago</TableCell>
                    <TableCell className='px-8'>2 days ago</TableCell>
                </TableRow>
                <TableRow className='bg-white'>
                    <TableCell className='px-8'>
                        <Button variant='link' className='text-left' asChild size='fit'>
                            <Link href={`${baseUrl}/second_flow_id`}>
                                Flow 2
                            </Link>
                        </Button>
                    </TableCell>
                    <TableCell className='px-8'>active</TableCell>
                    <TableCell className='px-8'>2 days ago</TableCell>
                    <TableCell className='px-8'>2 days ago</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}

export default WorkflowsTable