export type DateType = Date | number | string;

export type SharedFields = {
    id: string;
    created_at: DateType;
    updated_at: DateType | null;
}

export type OrderingFields = {
    id: string
}