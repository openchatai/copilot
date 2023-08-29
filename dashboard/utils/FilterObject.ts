type FilteredKeys<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export function filterObject<T, U>(
    obj: T,
    keys: Array<FilteredKeys<T, U>>
): Pick<T, FilteredKeys<T, U>> {
    const result: Partial<Pick<T, FilteredKeys<T, U>>> = {};

    for (const key of keys) {
        result[key] = obj[key];
    }

    return result as Pick<T, FilteredKeys<T, U>>;
}