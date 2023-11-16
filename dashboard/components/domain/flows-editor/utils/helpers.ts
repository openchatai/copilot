export function parse(value: string) {
    if (value === null || value === undefined) return undefined;
    try {
        return JSON.parse(value);
    } catch (error) {
        return value;
    }
}
export function stringify(value: any): string {
    try {
        return JSON.stringify(value);
    } catch (error) {
        return value || undefined;
    }
}
export function getStorageValue(key: string, initialValue: any) {
    const value = window.localStorage.getItem(key);
    if (value) {
        return parse(value);
    }
    return initialValue;
}
export function setStorageValue(key: string, value: any) {
    localStorage.setItem(key, stringify(value));
}
