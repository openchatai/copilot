import type { ComponentProps } from "../contexts/componentRegistery";

type Props = ComponentProps<unknown>;

/**
 * The Basic Text component
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
