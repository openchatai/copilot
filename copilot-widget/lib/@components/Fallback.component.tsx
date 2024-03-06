import { BotMessageWrapper } from "@lib/components/Messages";

type Props = {
  id: string | number;
  data: any;
};
/**
 * The Basic Text component
 */
export function Fallback(props: Props) {
  const { data, id } = props;
  return (
    <BotMessageWrapper id={id}>
      <div className="space-y-2 flex-1">
        <div className=" w-fit">
          <div dir="auto">{JSON.stringify(data, null, 2)}</div>
        </div>
      </div>
    </BotMessageWrapper>
  );
}
