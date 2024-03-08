type Props = {
  id: string | number;
  data: any;
};
/**
 * The Basic Text component
 */
export function Fallback(props: Props) {
  const { id, ...data } = props.data;
  return (
    <div className="space-y-2 flex-1">
      <div className="w-full max-w-full overflow-auto">
        <code dir="auto" className="text-xs leading-tight">
          {JSON.stringify(data, null, 1)}
        </code>
      </div>
    </div>
  );
}
