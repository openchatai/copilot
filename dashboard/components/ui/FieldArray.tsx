import { ReactNode } from 'react';
import { useFieldArray } from 'react-hook-form'
import type { FieldValues, UseFieldArrayProps, FieldArrayPath, UseFieldArrayReturn } from "react-hook-form";
// we will create a simple HOC to wrap around the useFieldArrat hook;

export function FieldArray<
    TFieldValues extends FieldValues = FieldValues, TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>, TKeyName extends string = 'id'
>(
    { render, ...props }: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName> & { render: (props: UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName>) => ReactNode }
) {
    const ufa = useFieldArray(props)
    return render(ufa)
}