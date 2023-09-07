"use client";
import { FieldProps, useField } from "@formiz/core";
import { useEffect, useState } from "react";
import { Input, type InputProps } from "./BaseInput";
import React from "react";

export const FormField = ({
  debounce = 200,
  onFocus,
  onBlur,
  onChange,
  ...props
}: FieldProps & InputProps) => {
  const {
    errorMessage,
    isValid,
    isPristine,
    isSubmitted,
    resetKey,
    setValue,
    value,
    ...fieldProps
  } = useField({ ...props, debounce });
  const { label, type, required } = props;
  const [isFocused, setIsFocused] = useState(isPristine);
  const showError = !isValid && !isFocused && (!isPristine || isSubmitted);
  const showSuccess = isValid && !isFocused && (!isPristine || isSubmitted);
  const state = showError ? "error" : showSuccess ? "success" : undefined;
  const defaultValue = props.defaultValue ?? props.value ?? "";
  useEffect(() => {
    if (defaultValue) setValue(defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Input
      {...props}
      value={value ?? defaultValue}
      defaultValue={defaultValue}
      onChange={(ev) => {
        setValue(ev.target.value);
        onChange?.(ev);
      }}
      onBlur={(ev) => {
        setIsFocused(false);
        onBlur?.(ev);
      }}
      required={required}
      type={type}
      label={label}
      state={state}
      key={resetKey}
      errorMsg={showError ? errorMessage : undefined}
      onFocus={(ev) => {
        setIsFocused(true);
        onFocus?.(ev);
      }}
      {...fieldProps}
    />
  );
};
