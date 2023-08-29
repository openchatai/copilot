import { useField, FieldProps } from "@formiz/core";
import { ImageInputProps, ImageInput } from "../ImageInput";
type Props = ImageInputProps & FieldProps;
export function ImageField(props: Props) {
  const { value, setValue } = useField(props);

  return (
    <ImageInput
      value={value}
      onChange={(ev) => setValue(ev.target.files?.[0])}
    />
  );
}
