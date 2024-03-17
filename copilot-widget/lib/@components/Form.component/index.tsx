import validator from "@rjsf/validator-ajv8";
import Form from "./rjfs";
import type { ComponentProps } from "@lib/types";

type Props = ComponentProps<{
  schema: any;
  submitUrl: string;
  method?: "POST" | "GET";
}>;

/**
 * The Basic Form component
 */
export function FormComponent(props: Props) {
  const {
    id,
    data: { schema, submitUrl, method },
  } = props;
  return (
    <div className="space-y-2 flex-1">
      <div className="w-full">
        <div dir="auto" className="bg-accent w-full rounded-lg p-2">
          <Form
            action={submitUrl}
            method={method ?? "POST"}
            schema={schema}
            validator={validator}
          />
        </div>
      </div>
    </div>
  );
}
