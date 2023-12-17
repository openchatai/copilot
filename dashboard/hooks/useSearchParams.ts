import { useSearchParams as useNextSearchParams } from "next/navigation";

class Params extends URLSearchParams {
    constructor(init?: string | URLSearchParams) {
        super(init);
    }
    get(name: string): string | null {
        return super.get(name);
    }
    set(name: string, value: string) {
        super.set(name, value);
        return this
    }
    delete(name: string) {
        super.delete(name);
        return this
    }
}

export function useSearchParams() {
    const params = useNextSearchParams();
    return new Params(params);
}