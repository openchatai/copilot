import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import React, { ElementRef } from "react";
type Props<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
    options: { label: string, value: string }[]
    placeholder?: string;
    defaultValue?: string;
    className?: string;
} & ControllerRenderProps<TFieldValues, TName>

export const SelectField = React.forwardRef<ElementRef<'button'>, Props>(({
    value,
    name,
    defaultValue,
    onChange,
    options,
    placeholder,
    className
}, _ref) => (
    <Select
        value={value}
        defaultValue={defaultValue ?? value}
        name={name}
        onValueChange={(value) => {
            onChange({
                target: {
                    value,
                    name: name,
                },
                type: 'change'
            })
        }}>
        <SelectTrigger ref={_ref} className={className}>
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                    {option.label}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
))
SelectField.displayName = 'SelectField';