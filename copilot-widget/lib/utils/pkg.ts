import json from "../../package.json";
export function get<K extends keyof typeof json>(key: K) {
  return json[key];
}
