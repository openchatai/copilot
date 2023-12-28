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
        transitionDuration: `0.0001s`,
        animationDelay: '0s !important',
    };
};

export function reorderList<T extends any>(list: T[], startIndex: number, endIndex: number) {
    const result = list;
    const [removed] = result.splice(startIndex, 1);
    if (removed) {
        result.splice(endIndex, 0, removed);
    }
    return result;
}