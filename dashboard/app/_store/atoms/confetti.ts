'use client';
import { atom, useAtom } from "jotai";

export const confettiAtom = atom(false);

export function useConfetti() {
    const [confetti, setConfetti] = useAtom(confettiAtom);
    function pop(seconds: number = 5) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), seconds * 1000);
    }
    return { confetti, pop };
}