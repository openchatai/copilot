import React from 'react'
import { Cuboid, Workflow } from 'lucide-react'
import { Panel } from 'reactflow';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

function Group({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex bg-white flex-col items-center justify-center p-0.5 rounded-lg'>
            {children}
        </div>
    )
}
function Actions() {
    return <Popover>
        <PopoverTrigger asChild>
            <Button variant='ghost' size='fit' className='flex-center aspect-square p-3'>
                <div className='flex flex-col items-center justify-center gap-0.5'>
                    <Workflow size={20} />
                    <span className='text-[10px] font-semibold'>
                        Action
                    </span>
                </div>
            </Button>
        </PopoverTrigger>
        <PopoverContent side='right' align='center' sideOffset={10}>
            Actions
        </PopoverContent>
    </Popover>
}

export function FloatingActionBar() {
    return (
        <Panel position="top-left" className='!top-1/4 p-1 bg-accent text-accent-foreground rounded-lg flex flex-col gap-2'>

            <Group>
                <Button variant='ghost' size='fit' className='flex-center aspect-square p-3'>
                    <div className='flex flex-col items-center justify-center gap-0.5'>
                        <Cuboid size={20} />
                        <span className='text-[10px] font-semibold'>Block</span>
                    </div>
                </Button>
            </Group>

            <Group>
                <Actions />
            </Group>
        </Panel>
    )
}
