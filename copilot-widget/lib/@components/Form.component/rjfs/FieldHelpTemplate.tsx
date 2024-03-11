import {
  FieldHelpProps,
  FormContextType,
  helpId,
  RJSFSchema,
  StrictRJSFSchema,
} from "@rjsf/utils"

/** The `FieldHelpTemplate` component renders any help desired for a field
 *
 * @param props - The `FieldHelpProps` to be rendered
 */
export default function FieldHelpTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: FieldHelpProps<T, S, F>) {
  const { idSchema, help, hasErrors } = props
  if (!help) {
    return null
  }
  const id = helpId<T>(idSchema)
  return (
    <span
      className={hasErrors ? "text-red-500" : "text-muted-foreground"}
      id={id}
    >
      {help}
    </span>
  )
}
