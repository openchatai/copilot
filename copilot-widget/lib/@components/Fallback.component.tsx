import type { ComponentProps } from "../contexts/componentRegistery";

type Props = ComponentProps<unknown>;

/**
 * The Basic Text component
 */
export function Fallback(props: Props) {
  return (
    <div className="space-y-2 flex-1">
      <div className="w-full max-w-full overflow-auto">
        <code dir="auto" className="text-xs leading-tight">
          {JSON.stringify(props, null, 1)}
        </code>
      </div>
    </div>
  );
}
