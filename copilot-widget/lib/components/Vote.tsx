import cn from '@lib/utils/cn';
import {
    ThumbsUp,
    ThumbsDown,
} from 'lucide-react';

const SIZE = 26;

export function Vote({
    onUpvote,
    onDownvote,
    isUpvoted = false,
    isDownvoted = true,
}: {
    onUpvote?: () => void,
    onDownvote?: () => void,
    isUpvoted: boolean,
    isDownvoted: boolean,
}) {
    return (
        <div className='opencopilot-flex opencopilot-items-center opencopilot-justify-end opencopilot-w-full opencopilot-gap-px [&>button]:opencopilot-p-1'>
            <button data-active={isUpvoted} className={cn('opencopilot-transition-all opencopilot-rounded-lg', isUpvoted ? '*:opencopilot-fill-primary' : 'active:*:opencopilot-scale-105')} onClick={() => onUpvote?.()}>
                <ThumbsUp size={SIZE} className='opencopilot-transition-all opencopilot-stroke-primary' />
            </button>
            <button data-active={isDownvoted} className={cn('opencopilot-transition-all opencopilot-rounded-lg', isDownvoted ? '*:opencopilot-fill-rose-500' : 'active:*:opencopilot-scale-105')} onClick={() => onDownvote?.()}>
                <ThumbsDown size={SIZE} className='opencopilot-transition-all opencopilot-stroke-rose-500' />
            </button>
        </div>
    )
}
