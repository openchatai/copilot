import type { ComponentProps, HandoffPayloadType } from "@lib/types";

type Props = ComponentProps<HandoffPayloadType>;

export function Handoff(props: Props) {
  return (
    <div className="w-full p-3">
      <button className="text-sm font-medium py-2 px-3 rounded-lg bg-primary text-white max-w-sm w-full">
        open an issue ticket
      </button>
      <p className="text-xs mt-1">
        this is the default handoff component.{" "} 
        <a className='text-primary' href="https://docs.opencopilot.so/resources/human-handoff">Read docs</a>
      </p>
    </div>
  );
}
