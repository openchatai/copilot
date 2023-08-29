'use client';
import { useRouter as useNextRouter } from "next/navigation";
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context'
import { useEvents } from "./Context";
export function useRouter(): AppRouterInstance {
    const { push, back, forward, replace, ...funcs } = useNextRouter();
    const { change } = useEvents()
    return {
        push(...opts) {
            change("changeStarted")
            push(...opts)
        },
        back() {
            change("changeStarted")
            back()
        },
        forward() {
            change("changeStarted")
            forward()
        },
        replace(...opts) {
            change("changeStarted")
            replace(...opts)
        },
        ...funcs
    }
}