import { atom } from "jotai";
import _ from "lodash";
import { premadeTemplates } from "./premade";
import { CopilotType, ValidatorResponseType } from "@/data/copilot";

export const CreatedCopilotAtom = atom<CopilotType | null>(null);
export const swaggerAtom = atom<File[] | null>(null);
export const selectedTemplateAtomKey = atom<string | undefined>(undefined);
export const Validations = atom<ValidatorResponseType | undefined>(undefined);
export const WizardDataStateAtom = atom((get) => ({
  createdCopilot: get(CreatedCopilotAtom),
  swaggerFile: _.first(get(swaggerAtom)),
  selectedTemplate: premadeTemplates.find(
    (temp) => temp.id === get(selectedTemplateAtomKey),
  ),
  is_premade_demo_template: get(CreatedCopilotAtom)?.is_premade_demo_template,
  validations: get(Validations),
}));
