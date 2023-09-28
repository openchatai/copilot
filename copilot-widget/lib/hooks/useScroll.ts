import { useState, useEffect, RefObject } from 'react';

interface ScrollPosition {
    x: number;
    y: number;
}

const useScroll = (targetRef: RefObject<HTMLElement>): ScrollPosition => {
    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
        x: 0,
        y: 0,
    });

    useEffect(() => {
        const handleScroll = () => {
            if (targetRef.current) {
                const { scrollWidth, scrollHeight, clientWidth, clientHeight } = targetRef.current;

                setScrollPosition({
                    x: (targetRef.current.scrollLeft / (scrollWidth - clientWidth)),
                    y: (targetRef.current.scrollTop / (scrollHeight - clientHeight)),
                });
            }
        };

        const targetElement = targetRef.current;

        if (targetElement) {
            targetElement.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (targetElement) {
                targetElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [targetRef]);

    return scrollPosition;
};

export default useScroll;
