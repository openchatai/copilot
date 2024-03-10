import {
  FormContextType,
  IconButtonProps,
  RJSFSchema,
  StrictRJSFSchema,
  TranslatableString,
} from "@rjsf/utils";
import { PlusIcon } from "lucide-react";

export default function AddButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({ uiSchema, registry, ...props }: IconButtonProps<T, S, F>) {
  const { translateString } = registry;
  return (
    <button
      {...props}
      style={{ width: "100%" }}
      className={`ml-1 grid justify-items-center bg-blue-500 px-4 py-2 text-base font-normal text-white hover:bg-blue-700 ${props.className}`}
      title={translateString(TranslatableString.AddItemButton)}
    >
      <PlusIcon className="size-5"/>
    </button>
  );
}
