import {
  errorId,
  FieldErrorProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from "@rjsf/utils"

/** The `FieldErrorTemplate` component renders the errors local to the particular field
 *
 * @param props - The `FieldErrorProps` for the errors being rendered
 */
export default function FieldErrorTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: FieldErrorProps<T, S, F>) {
  const { errors = [], idSchema } = props
  if (errors.length === 0) {
    return null
  }
  const id = errorId<T>(idSchema)

  return (
    <ul className="list-inside list-none" id={id}>
      {errors.map((error, i) => {
        return (
          <li key={i} className="m-0 border-0 p-0">
            <small className="m-0 text-red-500">{error}</small>{" "}
          </li>
        )
      })}
    </ul>
  )
}
