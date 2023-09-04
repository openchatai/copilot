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
import { deleteCopilot, updateCopilot } from "api/copilots";
import { useRouter } from "@/ui/router-events";
import { toast } from "@/ui/components/headless/toast/use-toast";
import { useBotData } from "@/ui/providers/BotDataProvider";

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
    bot_context: botData?.prompt_message,
  };
  async function onSubmit(values: { bot_name: string; bot_context: string }) {
    const response = await updateCopilot(bot_id, {
      name: values.bot_name,
      prompt_message: values.bot_context,
    });
    if (response.status === 200) {
      refresh();
      toast({
        title: "Bot updated successfully",
        description: "Bot settings updated successfully",
        intent: "success",
      });
    }
  }
  return (
    <div>
      <Formiz
        autoForm
        connect={settingsForm}
        initialValues={initialValues}
        onValidSubmit={onSubmit}
      >
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
          <ChangeBotContext
            name="bot_context"
            defaultContext={botData.prompt_message}
          />
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
                    await deleteCopilot(bot_id);
                    toast({
                      title: "Bot deleted successfully",
                      description: "Bot deleted successfully",
                      intent: "success",
                    });
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
            <Button
              onClick={() => settingsForm.reset()}
              variant={{ intent: "secondary", size: "base" }}
            >
              Cancel
            </Button>
            <Button
              variant={{ intent: "primary", size: "base" }}
              onClick={() => settingsForm.submit()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
