import { atom, useAtom } from "jotai";
export const searchModalAtom = atom<boolean>(false);
export const useSearchModal = () => useAtom(searchModalAtom);