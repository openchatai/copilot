"use client";
import Alert from "@/ui/components/Alert";
import Badge from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { DoubleCheckButton } from "@/ui/components/DoubleCheckButton";
import { Input } from "@/ui/components/inputs/BaseInput";
import { FormField } from "@/ui/components/inputs/FormInput";
import { Separator } from "@/ui/components/Separator";
import ChangeBotContext from "@/ui/partials/ChangeBotContext";
import DescriptiveHeading from "@/ui/partials/DescriptiveHeading";
import { Formiz, useForm } from "@formiz/core";
import { useRouter } from "next/navigation";
import axiosInstance from "utils/axiosInstance";
import { replaceTemplateString } from "utils/repalceTemplateString";
import { useBotData } from "../../../_providers/BotDataProvider";

async function deleteBot(botId: string) {
  return axiosInstance.delete(
    replaceTemplateString("/bots/:id", {
      id: botId,
    })
  );
}

export default function ChatBotDetailedViewGeneralSettings({
  params: { bot_id },
}: {
  params: {
    bot_id: string;
  };
}) {
  const { push, refresh } = useRouter();
  const settingsForm = useForm();
  const { bot: botData } = useBotData();
  const initialValues = {
    bot_name: botData?.name,
  };
  return (
    <div>
      <Formiz autoForm connect={settingsForm} initialValues={initialValues}>
        <section>
          <DescriptiveHeading heading={"General Settings"}>
            Control your copilot settings and prompts
          </DescriptiveHeading>
          <div className="grid mt-5 sm:grid-cols-2 grid-cols-1 gap-4">
            <FormField label="Name" name="bot_name" />
            <Input label="Bot ID" copy value={botData.id} />
          </div>
        </section>
        <Separator orientation="horizontal" className="bg-transparent" />
        <section>
          <DescriptiveHeading heading="ِCustom Context">
            You can change your copilot initial context / prompt from here. also
            you can change the copilot response language.
          </DescriptiveHeading>
          <ChangeBotContext />
        </section>

        <Separator orientation="horizontal" />

        <Separator orientation="horizontal" className="bg-transparent" />
        <section>
          <DescriptiveHeading
            heading="Delete the co-pilot"
            badge={
              <Badge size="sm" intent="danger" indicator>
                danger
              </Badge>
            }
          >
            Deleting the bot will delete all the data associated with it.
          </DescriptiveHeading>

          <div className="w-full flex justify-start mt-5">
            <Alert
              type="danger"
              action={
                <DoubleCheckButton
                  variant={{ intent: "danger", size: "xs" }}
                  onClick={async () => {
                    await deleteBot(bot_id);
                    push("/app");
                  }}
                >
                  Yes,Delete it
                </DoubleCheckButton>
              }
              trigger={<Button variant={{ intent: "danger" }}>Delete</Button>}
              title="Are you sure you want to delete the bot"
            >
              Deleting the Copilot will delete all the data associated with it.
            </Alert>
          </div>
        </section>
      </Formiz>
      {/* settings footer */}
      <footer className="mt-4">
        <div className="flex flex-col py-5 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-end gap-3">
            <Button variant={{ intent: "secondary", size: "base" }}>
              Cancel
            </Button>
            <Button variant={{ intent: "primary", size: "base" }}>
              Save Changes
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
