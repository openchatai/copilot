import { useDownvote, useUpvote } from '@lib/hooks/useVote';
import cn from '@lib/utils/cn';
import {
    ThumbsUp,
    ThumbsDown,
} from 'lucide-react';

const SIZE = 26;

export function Vote({ messageId }: { messageId: number }) {
    const [asyncUpvoteState, asyncUpvote] = useUpvote(String(messageId));
    const [asyncDownvoteState, asyncDownvote] = useDownvote(String(messageId));
    const isUpvoted = !!asyncUpvoteState.value?.data.message;
    const isDownvoted = !!asyncDownvoteState.value?.data.message;
    const userVoted = isUpvoted || isDownvoted;
    return (
        <div className='opencopilot-flex opencopilot-items-center opencopilot-justify-end opencopilot-w-full opencopilot-gap-px [&>button]:opencopilot-p-1'>
            {
                userVoted ? <span className='opencopilot-text-xs text-blur-out opencopilot-text-emerald-500'>thank you</span> : <><button onClick={asyncUpvote} className={cn('opencopilot-transition-all opencopilot-rounded-lg', isUpvoted ? '*:opencopilot-fill-emerald-500' : 'active:*:opencopilot-scale-105')}>
                    <ThumbsUp size={SIZE} className='opencopilot-transition-all opencopilot-stroke-emerald-500' />
                </button>
                    <button onClick={asyncDownvote} className={cn('opencopilot-transition-all opencopilot-rounded-lg', isDownvoted ? '*:opencopilot-fill-rose-500' : 'active:*:opencopilot-scale-105')}>
                        <ThumbsDown size={SIZE} className='opencopilot-transition-all opencopilot-stroke-rose-500' />
                    </button></>
            }

        </div>
    )
}
