import { useSyncExternalStore } from "react";
function getSnapshot() {
    return navigator.onLine;
}
function subscribe(callback: (ev: Event) => void) {
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
    };
}
export function useOnline() {
    const online = useSyncExternalStore<boolean>(subscribe, getSnapshot, () => true)
    console.log('online', online)
    return online
}