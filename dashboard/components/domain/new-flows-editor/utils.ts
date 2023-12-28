import type { CSSProperties } from 'react';
import type { DraggableStateSnapshot } from 'react-beautiful-dnd';
// lower the transition duration to 5ms to make the animation snappier
export const getStyle = (
    style?: CSSProperties,
    snapshot?: DraggableStateSnapshot,
) => {
    if (!snapshot?.isDropAnimating) {
        return style;
    }
    return {
        ...style,
        transitionDuration: `0.005s`,
    };
};
