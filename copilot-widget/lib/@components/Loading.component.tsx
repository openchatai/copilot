import { BotMessageWrapper } from "@lib/components/Messages";
import { useChatState } from "@lib/contexts/statefulMessageHandler";

/**
 * The Basic Loading component
 */
export function Loading() {
  const { conversationInfo } = useChatState();
  if (!conversationInfo) return null;
  return (
    <BotMessageWrapper id="">
      <div className="space-y-2 flex-1">
        <div className="w-fit">
          <div dir="auto" className="text-ellipsis text-xs">{conversationInfo}</div>
        </div>
      </div>
    </BotMessageWrapper>
  );
}
