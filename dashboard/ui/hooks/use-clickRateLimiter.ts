import { useState, useEffect } from 'react';

export function useClickLimiter(limitTime: number) {
    const [isClickAllowed, setIsClickAllowed] = useState<boolean>(true);

    useEffect(() => {
        if (!isClickAllowed) {
            const timer = setTimeout(() => {
                setIsClickAllowed(true);
            }, limitTime);

            return () => clearTimeout(timer);
        }
    }, [isClickAllowed, limitTime]);

    const getClickHandler = (customClickHandler?: () => void) => {
        return () => {
            if (isClickAllowed) {
                setIsClickAllowed(false);

                if (customClickHandler) {
                    customClickHandler();
                }
            }
        };
    };

    return { isClickAllowed, getClickHandler };
}
