import { atom } from "jotai";

export const activeSessionId = atom<string | null>(null);
export const conversationsPageNum = atom(1);
export const chatsPageNum = atom(1);