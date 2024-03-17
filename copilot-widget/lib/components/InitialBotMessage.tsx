import { isEmpty } from "@lib/utils/utils.ts";
import { BotMessageWrapper } from "@lib/components";

export function InitialBotMessage({ message }: { message: string }) {
  if (isEmpty(message)) return null;

  return (
    <BotMessageWrapper id={""}>
      <div className="space-y-2 flex-1">
        <div className=" w-fit">
          <div dir="auto">{message}</div>
        </div>
      </div>
    </BotMessageWrapper>
  );
}
