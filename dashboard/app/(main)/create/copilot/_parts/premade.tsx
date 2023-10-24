import { PetStoreCopilotType, createPetstoreTemplate } from "@/data/copilot";
import { AxiosResponse } from "axios";
import { Cat } from "lucide-react";
import type { ReactNode } from "react";

type PremadeTemplate<T> = {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  // we dont know the type of the response it depends on the selected template so we want to keep it generic
  creatorFn: (...args: any[]) => Promise<AxiosResponse<T>>;
};
const petStoreTemplate: PremadeTemplate<PetStoreCopilotType> = {
  id: "pet_store",
  name: "Pet Store",
  description: "Simple Pet store templeate with crud operations",
  icon: <Cat className="h-6 w-6" />,
  creatorFn: createPetstoreTemplate,
};

export const premadeTemplates = [petStoreTemplate];
