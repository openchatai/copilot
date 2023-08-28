import { CardWrapper } from "@/ui/components/wrappers/CardWrapper";
import { Heading } from "@/ui/components/Heading";

function BotDetailViewLayout({
  params: { bot_id },
  children,
}: {
  params: { bot_id: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="w-full">
        <Heading className="font-semibold" level={3}>
        Copilot Settings
        </Heading>
      </div>
      <CardWrapper>{children}</CardWrapper>
    </div>
  );
}

export default BotDetailViewLayout;
