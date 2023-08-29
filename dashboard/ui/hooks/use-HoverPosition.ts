import { RefObject, useEffect, useRef, useState } from 'react';

interface Position {
    x: number;
    y: number;
}

function useHoverPosition(_targetElement: RefObject<HTMLElement>): [Position, boolean] {
    const targetElement = _targetElement.current;
    const [isHovered, setIsHovered] = useState(false);
    const [position, setPos] = useState<Position>({ x: 0, y: 0 });

    useEffect(() => {
        function handleMouseEnter(): void {
            setIsHovered(true);
        }

        function handleMouseLeave(): void {
            setIsHovered(false);
        }

        function handleMouseHover(event: MouseEvent): void {
            setPos({ x: event.clientX, y: event.clientY });
        }

        if (targetElement) {
            targetElement.addEventListener('mouseenter', handleMouseEnter);
            targetElement.addEventListener('mouseleave', handleMouseLeave);
            targetElement.addEventListener('mousemove', handleMouseHover);
        }

        return () => {
            if (targetElement) {
                targetElement.removeEventListener('mouseenter', handleMouseEnter);
                targetElement.removeEventListener('mouseleave', handleMouseLeave);
                targetElement.removeEventListener('mousemove', handleMouseHover);
            }
        };
    }, [targetElement]);

    return [position, isHovered];
}

export { useHoverPosition }
