import { RefObject } from 'react';

const useScrollToPercentage = (elementRef: RefObject<HTMLElement>
): [(percentageX: number, percentageY: number) => void
    ] => {
    const scrollToPercentage = (percentageX: number, percentageY: number) => {
        if (elementRef.current) {
            const { scrollWidth, scrollHeight } = elementRef.current;
            const maxScrollX = scrollWidth - elementRef.current.clientWidth;
            const maxScrollY = scrollHeight - elementRef.current.clientHeight;

            const scrollToX = (percentageX / 100) * maxScrollX;
            const scrollToY = (percentageY / 100) * maxScrollY;

            elementRef.current.scrollTo(scrollToX, scrollToY);
        }
    };

    return [scrollToPercentage];
};

export default useScrollToPercentage;
