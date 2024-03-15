import { ComponentProps, HandoffPayloadType } from "..";

type Props = ComponentProps<HandoffPayloadType>;

export function HandoffComponentRenderer(props: Props) {
  return (
    <div className="w-full">
      <span>{props.data.sentiment}</span>
      <span>{props.data.summery}</span>
    </div>
  );
}
