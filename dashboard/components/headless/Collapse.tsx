import { cn } from '@/lib/utils';
import React from 'react'
import { useMeasure } from 'react-use';
type Props = {
    maxHeight: number;
    children: React.ReactNode;
    className?: string;
    expanded?: boolean;
}

export function ExpandCollapse({ children, maxHeight, className, expanded }: Props) {
    const [ref, { height }] = useMeasure<HTMLDivElement>();
    const [isExpanded, setIsExpanded] = React.useState(expanded);
    const isOverflowing = maxHeight < height + 1;
    return (
        <div
            ref={ref}
            className={cn('relative', className)}
            style={{
                overflow: 'hidden',
                maxHeight: isExpanded ? 'none' : maxHeight,
                transition: 'max-height 0.3s ease-out',
            }}
        >
            {children}
            {
                isOverflowing && (
                    <div
                        className='w-full absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t flex-center from-black/70 pointer-events-none to-transparent'
                    >
                        <button onClick={() => setIsExpanded(!isExpanded)} className='w-full text-center text-white font-medium pointer-events-auto'>
                            {isExpanded ? 'Collapse' : 'Expand'}
                        </button>
                    </div>
                )
            }

        </div>
    )
}