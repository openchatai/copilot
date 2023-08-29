import React, { type ComponentPropsWithoutRef } from "react";
import { useField } from "@formiz/core";
import { DropZone, type DropZoneProps } from "../DropZone";

export function FileInput({
  name,
  required,
  ...props
}: Omit<
  Omit<ComponentPropsWithoutRef<"input">, "accept"> & DropZoneProps,
  "name" | "onDrop" | "onChange"
> & {
  name: string;
}) {
  const { value, setValue } = useField({ name, required });

  function onChange(files: File[]) {
    if (!files) return;
    setValue(files);
  }

  return <DropZone {...props} value={value} onChange={onChange} />;
}
