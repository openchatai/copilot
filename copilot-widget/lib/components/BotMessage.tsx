import { BotMessageType } from "@lib/types";
import { useMessageHandler } from "@lib/contexts/statefulMessageHandler";
import { useConfigData } from "@lib/contexts/ConfigData";
import { ComponentType } from "react";

export function BotMessage({
  message,
  index,
}: {
  message: BotMessageType;
  index: number;
}) {
  const { __components } = useMessageHandler();
  const config = useConfigData();

  const component = __components.getComponent(message.type, config.debug);
  if (!component) {
    return null;
  }
  const Component = component as ComponentType<{
    data: BotMessageType["data"];
    id: string;
  }>;

  return (
    <Component
      {...message}
      data={message.data ?? {}}
      id={message.id}
      key={index}
    />
  );
}
