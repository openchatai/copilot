import { BotMessageWrapper } from "../../components/Messages";
import validator from "@rjsf/validator-ajv8";
import Form from "./rjfs";

type Props = {
  id: string | number;
};
/**
 * The Basic Form component
 */
export function FormComponent(props: Props) {
  const { id } = props;
  return (
    <BotMessageWrapper id={id}>
      <div className="space-y-2 flex-1">
        <div className=" w-fit">
          <div dir="auto">
            <Form schema={{}} validator={validator} />
          </div>
        </div>
      </div>
    </BotMessageWrapper>
  );
}
