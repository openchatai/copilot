import { object, string, type Output, instance, array } from "valibot";
import { File } from "@web-std/file"
export const CreateBotSchema = object({
    json_files: array(instance(File))
});

export type CreateBotSchemaType = Output<typeof CreateBotSchema>;