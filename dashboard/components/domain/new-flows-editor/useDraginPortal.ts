import { ReactElement, useEffect, useRef } from "react"
import { DraggableProvided, DraggableStateSnapshot, DraggingStyle } from "react-beautiful-dnd"
import { createPortal } from "react-dom"
const PORTAL_ID = 'draggable-portal';

function createElement(id: string): HTMLDivElement {
    const el = document.getElementById(id);
    if (el) {
        return el as HTMLDivElement;
    }
    const div = document.createElement('div');
    div.id = id;
    return div;
}
function setupStyles(element: HTMLDivElement) {
    element.style.pointerEvents = 'none';
    element.style.isolation = 'isolate';
    element.style.position = 'fixed';
    element.style.inset = '0';
    element.style.zIndex = '1000';
    element.style.overflow = 'hidden';
    return element;
}
export const useDraggableInPortal = () => {
    const element = useRef<HTMLDivElement>(createElement(PORTAL_ID)).current
    useEffect(() => {
        if (element) {
            document.body.appendChild(setupStyles(element))
            return () => {
                if (element.parentElement) element.parentElement.removeChild(element)
            }
        }
    }, [element])

    // eslint-disable-next-line no-unused-vars
    return (render: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => ReactElement) => (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
        const result = render(provided, snapshot)
        const style = provided.draggableProps.style as DraggingStyle
        if (style.position === 'fixed') {
            return createPortal(result, element)
        }
        return result
    }
}
