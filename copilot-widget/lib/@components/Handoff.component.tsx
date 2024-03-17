import type { ComponentProps, HandoffPayloadType } from "@lib/types";

type Props = ComponentProps<HandoffPayloadType>;

export function Handoff(props: Props) {
  return (
    <div className="w-full">
      <span>{props.data.sentiment}</span>
      <span>{props.data.summary}</span>
    </div>
  );
}
