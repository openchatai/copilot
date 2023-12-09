import { useEffect, useState } from "react";

export function useTextRotator({ texts, intervalInSeconds }: { texts: string[], intervalInSeconds: number }) {
    const [textObjects, setTextObjects] = useState(texts.map((text, index) => ({
        text,
        isVisible: index === 0,
        order: index
    })));

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (textObjects.length > 1) {
            interval = setInterval(() => {
                setTextObjects((prev) => {
                    const next = [...prev];
                    const currentVisibleIndex = next.findIndex(({ isVisible }) => isVisible);
                    const nextIndex = currentVisibleIndex + 1;
                    if (nextIndex < next.length) {
                        next[currentVisibleIndex].isVisible = false;
                        next[nextIndex].isVisible = true;
                    } else {
                        clearInterval(interval);
                    }
                    return next;
                })
            }, intervalInSeconds * 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        }
    }, [texts, intervalInSeconds, textObjects]);

    return textObjects
};