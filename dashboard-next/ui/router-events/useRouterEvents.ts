'use client';
import { useEffect } from "react";
import { useEvents } from "./Context";

export function useOnRouterChange({ onRouteChangeStart, onRouteChangeComplete }: { onRouteChangeStart?: () => void, onRouteChangeComplete?: () => void }) {
    const { event } = useEvents()
    useEffect(() => {
        if (event === "changeStarted") {
            onRouteChangeStart?.()
        }
        if (event === "changeCompleted") {
            onRouteChangeComplete?.()
        }

    }, [event, onRouteChangeComplete, onRouteChangeStart])
}