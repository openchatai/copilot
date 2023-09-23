'use client';
import { useRouter as useNextRouter } from "next/navigation";
import { useEvents } from "./Context";

type AppRouterInstance = ReturnType<typeof useNextRouter>;

export function useRouter(): AppRouterInstance {
    const { push: originalPush, back, forward, replace, ...rest } = useNextRouter();
    const { change } = useEvents();

    return {
        ...rest,
        push: (...args: Parameters<AppRouterInstance['push']>) => {
            change("changeStarted");
            originalPush(...args);
        },
        back: () => {
            change("changeStarted");
            back();
        },
        forward: () => {
            change("changeStarted");
            forward();
        },
        replace: (...args: Parameters<AppRouterInstance['replace']>) => {
            change("changeStarted");
            replace(...args);
        }
    };
}