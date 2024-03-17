import { useChatState } from "@lib/hooks";
import { getLast } from "@lib/utils/utils";
import { useConfigData } from "@lib/contexts";
import { BotIcon } from "@lib/components";

export function BotMessageWrapper({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string | number;
}) {
  const { messages } = useChatState();
  const isLast = getLast(messages.filter((m) => m.from === "bot"))?.id === id;
  const config = useConfigData();

  return (
    <div className="p-2 group w-full shrink-0">
      <div className="flex items-center gap-3 w-full" dir="auto">
        <span className="mt-auto">
          <BotIcon />
        </span>
        <div className="flex-1">{children}</div>
      </div>

      {isLast && (
        <div className="w-full ps-10 flex-nowrap flex items-center justify-between">
          <span className="text-xs m-0">{config?.bot?.name ?? "Bot"}</span>
        </div>
      )}
    </div>
  );
}
