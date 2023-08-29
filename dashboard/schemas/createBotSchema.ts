import { object, string, type Output, instance, array } from "valibot";
import { File } from "@web-std/file"
export const CreateBotSchema = object({
    bot_name: string(),
    json_files: array(instance(File))
});

export type CreateBotSchemaType = Output<typeof CreateBotSchema>;