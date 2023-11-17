import { atom } from "jotai";

export const activeSessionId = atom<string | null>(null);
