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
}
