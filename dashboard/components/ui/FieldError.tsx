import type { ReactNode } from 'react';
import type { FieldPath, FieldValues, FormState, Message } from 'react-hook-form';

export function FormErrorMessage<
    TValues extends FieldValues = FieldValues,
    TName extends FieldPath<TValues> = FieldPath<TValues>
>({ name, formState, children }: {
    name: TName,
    formState: FormState<TValues>
    children?: ReactNode
}) {
    const errors = formState.errors?.[name]?.message as (Message | null);
    const body = errors ? errors : children
    if (!body) return null
    return (
        <p className="text-xs text-destructive">
            {errors}
        </p>
    )
}