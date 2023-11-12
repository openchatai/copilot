import { atom } from "jotai";

export const searchQuery = atom("");

function extractQuery(text: string, allowedKeys?: string[]) {
    let q = text;
    const filters = new Set<{
        key: string;
        v: string;
        allowed: boolean;
    }>();

    const pattern = /(\w+):'([^']*)'/g;
    const matches = text.match(pattern);
    if (matches) {
        matches.forEach((ma) => {
            const [key, val] = ma.split(":");

            if (key && val) {
                q = q.replace(ma, "").trim();
                const v = val.trim().replace(/['"]/g, "");
                filters.add({
                    key,
                    v,
                    allowed: allowedKeys ? allowedKeys.includes(key) : true,
                });
            }
        });
    }
    return {
        text: q,
        filters: Array.from(filters),
    };
}

const allowedKeys = ["type"];
export const searchQueryAtom = atom((get) => {
    const s = get(searchQuery);
    return extractQuery(s, allowedKeys);
});