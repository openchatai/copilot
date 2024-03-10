import React from "react";
import { Fallback } from "@lib/@components/Fallback.component";
import { FormComponent } from "@lib/@components/Form.component";
import { Loading } from "@lib/@components/Loading.component";
import { Text } from "@lib/@components/Text.component";
import type { BotMessageType } from "./messageHandler";

export type ComponentProps<TData> = BotMessageType<TData>;

export type ComponentType = {
  key: string;
  component: React.ElementType;
};

type OptionsType = {
  components?: ComponentType[];
};
/**
 * this a singleton  class helps me to easily control the components present/available in the widget.
 * it also manges the various types of components to be added along the way.
 */
export class ComponentRegistery {
  components: ComponentType[] = [
    {
      key: "TEXT",
      component: Text,
    },
    {
      key: "FALLBACK",
      component: Fallback,
    },
    {
      key: "FORM_COMPONENT",
      component: FormComponent,
    },
    {
      key: "LOADING",
      component: Loading,
    },
  ] as const;

  constructor(opts: OptionsType) {
    const { components } = opts;

    if (components) {
      components.forEach((c) => this.register(c));
    }
    if (this.components.length === 0) {
      throw new Error("No components registered");
    } else if (!this.get("FALLBACK")) {
      throw new Error("No fallback component registered");
    }
  }

  register(com: ComponentType) {
    // Replace the key if already exists
    const index = this.components.findIndex((c) => c.key === com.key);
    if (index !== -1) {
      this.components[index] = com;
    } else {
      this.components.push(com);
    }
    return this;
  }

  get(key: string) {
    const c = this.components.find((c) => c.key === key);
    if (c) return c;
    return null;
  }

  getOrFallback(key?: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return key ? this.get(key) || this.get("FALLBACK")! : this.get("FALLBACK")!;
  }
}
