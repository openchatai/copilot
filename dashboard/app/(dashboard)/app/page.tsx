import { Heading } from "@/ui/components/Heading";
import WelcomeBanner from "@/ui/partials/WelcomeBanner";
import { Link } from "@/ui/router-events";
import { ChatBotCard } from "@/ui/partials/ChatBotCard";
import { Button } from "@/ui/components/Button";
import EmptyState from "@/ui/partials/EmptyState";
import { AiOutlinePlus } from "react-icons/ai";
import { getCopilots } from "api/copilots";
import { Map } from "@/ui/helper-components";

export const dynamic = "force-dynamic";
export const revalidate = 1;
async function DashboardIndex() {
  const { data: copilots } = await getCopilots();
  
  return (
    <>
      <WelcomeBanner />
      <div className="w-full max-w-[96rem] mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <section className="max-w-[96rem] w-full mt-5">
            <div className="w-full flex items-center justify-between mb-5">
              <Heading
                level={3}
                className="font-bold text-2xl md:text-3xl text-slate-800"
              >
                My Copilots ✨
              </Heading>
              <div>
                <Button
                  variant={{ intent: "primary" }}
                  className="flex-center gap-1 max-h-[34px]"
                  asChild
                >
                  <Link href="/app/bot/new">
                    <AiOutlinePlus className="h-4 w-4" />
                    <span className="hidden sm:inline-flex">
                      Create copilot
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-12 gap-6">
                {copilots ? (
                  <Map
                    data={copilots}
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
                ) : (
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
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default DashboardIndex;
