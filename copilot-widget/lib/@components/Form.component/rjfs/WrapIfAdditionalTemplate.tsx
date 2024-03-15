import {
  ADDITIONAL_PROPERTY_FLAG,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  TranslatableString,
  WrapIfAdditionalTemplateProps,
} from "@rjsf/utils";
import { FocusEvent } from "react";

export default function WrapIfAdditionalTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  classNames,
  style,
  children,
  disabled,
  id,
  label,
  onDropPropertyClick,
  onKeyChange,
  readonly,
  required,
  schema,
  uiSchema,
  registry,
}: WrapIfAdditionalTemplateProps<T, S, F>) {
  const { templates, translateString } = registry;
  // Button templates are not overridden in the uiSchema
  const { RemoveButton } = templates.ButtonTemplates;
  const keyLabel = translateString(TranslatableString.KeyLabel, [label]);
  const additional = ADDITIONAL_PROPERTY_FLAG in schema;

  if (!additional) {
    return (
      <div className={classNames} style={style}>
        {children}
      </div>
    );
  }

  const handleBlur = ({ target }: FocusEvent<HTMLInputElement>) =>
    onKeyChange(target.value);
  const keyId = `${id}-key`;

  return (
    <div className={`flex ${classNames}`} style={style}>
      <div className="w-1/2 flex-none p-2">
        <label
          htmlFor={keyId}
          className="block text-sm font-medium text-muted-foreground"
        >
          {keyLabel}
        </label>
        <input
          required={required}
          defaultValue={label}
          disabled={disabled || readonly}
          id={keyId}
          name={keyId}
          placeholder={translateString(TranslatableString.KeyLabel)}
          onBlur={!readonly ? handleBlur : undefined}
          type="text"
          className="mt-1 w-full border p-2 shadow-sm"
        />
      </div>
      <div className="w-1/2 flex-none p-2">{children}</div>
      <div className="w-1/4 flex-none p-2">
        <RemoveButton
          iconType="block"
          className="w-full"
          disabled={disabled || readonly}
          onClick={onDropPropertyClick(label)}
          uiSchema={uiSchema}
          registry={registry}
        />
      </div>
    </div>
  );
}
