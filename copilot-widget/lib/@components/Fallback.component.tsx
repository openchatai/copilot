import type { ComponentProps } from "@lib/types";

type Props = ComponentProps<unknown>;

/**
 * The Basic Fallback component (Rendered when Debug is True and the component key is not found)
 */
export function Fallback(props: Props) {
  return (
    <div className="w-full max-w-full overflow-auto shrink-0">
      <pre dir="auto" className="text-xs leading-tight">
        {JSON.stringify(props, null, 1)}
      </pre>
    </div>
  );
}
