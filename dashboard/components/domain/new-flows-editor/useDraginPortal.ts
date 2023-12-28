import { ReactElement, useEffect, useRef } from "react"
import { DraggableProvided, DraggableStateSnapshot, DraggingStyle } from "react-beautiful-dnd"
import { createPortal } from "react-dom"

export const useDraggableInPortal = () => {
    const element = useRef<HTMLDivElement>(document.createElement('div')).current

    useEffect(() => {
        if (element) {
            element.style.pointerEvents = 'none'
            element.style.isolation = 'isolate'
            element.style.position = 'absolute'
            element.style.inset = '0'
            element.style.zIndex = '9999'
            document.body.appendChild(element)
            return () => {
                // check if the element was removed by something else
                if (element.parentElement) {
                    element.parentElement.removeChild(element)
                }
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
