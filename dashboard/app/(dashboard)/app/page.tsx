import { Heading } from "@/ui/components/Heading";
import WelcomeBanner from "@/ui/partials/WelcomeBanner";
import { Link } from "@/ui/router-events";
import { ChatBotCard } from "@/ui/partials/ChatBotCard";
import { Button } from "@/ui/components/Button";
import EmptyState from "@/ui/partials/EmptyState";
import { AiOutlinePlus } from "react-icons/ai";
import { Map } from "@/ui/helper-components";
import { getCopilots } from "api/copilots";

export const dynamic = "force-dynamic";
async function DashboardIndex() {
  const response = await getCopilots();
  return (
    <div className="w-full max-w-[96rem] mx-auto">
      <WelcomeBanner />
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full flex items-center justify-end mb-5">
          <div className="flex items-center gap-2">
            <Button
              variant={{ intent: "primary" }}
              className="flex-center gap-1 max-h-[34px]"
              asChild
            >
              <Link href="/app/bot/new">
                <AiOutlinePlus className="h-4 w-4" />
                <span className="hidden sm:inline-flex">Create copilot</span>
              </Link>
            </Button>
          </div>
        </div>
        <section className="max-w-[96rem] w-full mt-5">
          <div className="w-full flex items-center justify-between mb-5">
            <Heading level={3} className="font-bold">
              My Copilots ✨
            </Heading>
            <div></div>
          </div>
          <div className="w-full max-w-full">
            <div className="grid grid-cols-12 gap-6">
              <Map
                data={response?.data}
                render={(bot, i) => <ChatBotCard {...bot} key={i} />}
                fallback={
                  <EmptyState
                    label="There is no Copilots Right now"
                    description="start by creating new one"
                    className="col-span-full"
                  >
                    <Button
                      asChild
                      variant={{
                        intent: "primary",
                        size: "sm",
                      }}
                    >
                      <Link href="/app/bot/new">Create Copilot</Link>
                    </Button>
                  </EmptyState>
                }
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardIndex;
