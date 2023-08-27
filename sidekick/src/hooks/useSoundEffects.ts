import { useInitialData } from "../contexts/InitialDataContext";

export function useSoundEffectes() {
    const idata = useInitialData();
    const d = {
        notify: new Audio(idata?.data?.sound_effects?.response),
        submit: new Audio(idata?.data?.sound_effects?.submit),
    };
    return d;
}