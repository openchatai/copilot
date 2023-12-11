export type DateType = Date | number | string;

export type SharedFields = {
    created_at: DateType;
    updated_at: DateType;
}

export type OrderingFields = {
    id: string
}

export type CombineTypes<T extends any[]> = T extends [infer First, ...infer Rest] ? First & CombineTypes<Rest> : {};

export type Union<T extends any[]> = T extends [infer First, ...infer Rest] ? First | Union<Rest> : never;