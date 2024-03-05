import { Text } from "@lib/@components/Text.component";
import React from "react";

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
  ];

  constructor(opts: OptionsType) {
    const { components } = opts;

    if (components) {
      components.forEach((c) => this.register(c));
    }
  }

  register(com: ComponentType) {
    const c = this.components.find((f) => f.key === com.key);
    if (c) return;
    this.components.push(com);
  }

  get(key: string) {
    return this.components.find((c) => c.key === key);
  }
}
