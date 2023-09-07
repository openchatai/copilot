import { CardWrapper } from "@/ui/components/wrappers/CardWrapper";
import { Heading } from "@/ui/components/Heading";
function BotDetailViewLayout({ children }: { children: React.ReactNode }) {
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
