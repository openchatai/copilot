import { redirect } from "next/navigation";

function BotOverviewPage({
  params,
}: {
  params: {
    bot_id: string;
  };
}) {
  return redirect(`/app/bot/${params.bot_id}/try&share`);
}

export default BotOverviewPage;
