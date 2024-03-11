import {
  ariaDescribedByIds,
  descriptionId,
  FormContextType,
  getTemplate,
  labelValue,
  RJSFSchema,
  schemaRequiresTrueValue,
  StrictRJSFSchema,
  WidgetProps,
} from "@rjsf/utils"
import { FocusEvent } from "react"

export default function CheckboxWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: WidgetProps<T, S, F>) {
  const {
    id,
    value,
    disabled,
    readonly,
    label,
    hideLabel,
    schema,
    autofocus,
    options,
    onChange,
    onBlur,
    onFocus,
    registry,
    uiSchema,
  } = props
  // Because an unchecked checkbox will cause html5 validation to fail, only add
  // the "required" attribute if the field value must be "true", due to the
  // "const" or "enum" keywords
  const required = schemaRequiresTrueValue<S>(schema)
  const DescriptionFieldTemplate = getTemplate<
    "DescriptionFieldTemplate",
    T,
    S,
    F
  >("DescriptionFieldTemplate", registry, options)

  const _onChange = ({ target: { checked } }: FocusEvent<HTMLInputElement>) =>
    onChange(checked)
  const _onBlur = ({ target: { checked } }: FocusEvent<HTMLInputElement>) =>
    onBlur(id, checked)
  const _onFocus = ({ target: { checked } }: FocusEvent<HTMLInputElement>) =>
    onFocus(id, checked)

  const description = options.description || schema.description
  return (
    <div
      className={`relative ${
        disabled || readonly ? "cursor-not-allowed opacity-50" : ""
      }`}
      aria-describedby={ariaDescribedByIds<T>(id)}
    >
      {!hideLabel && !!description && (
        <DescriptionFieldTemplate
          id={descriptionId<T>(id)}
          description={description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      <label className="mt-4 block">
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={typeof value === "undefined" ? false : value}
          required={required}
          disabled={disabled || readonly}
          autoFocus={autofocus}
          onChange={_onChange}
          onBlur={_onBlur}
          onFocus={_onFocus}
          className="form-checkbox text-primary"
        />
        <span className="ml-2">{labelValue(label, hideLabel || !label)}</span>
      </label>
    </div>
  )
}
