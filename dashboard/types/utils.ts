export const apiMethods = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
] as const;

export type ApiMethod = typeof apiMethods[number];

export type CombineTypes<T extends any[]> = T extends [infer First, ...infer Rest] ? First & CombineTypes<Rest> : {};

export type Union<T extends any[]> = T extends [infer First, ...infer Rest] ? First | Union<Rest> : never;