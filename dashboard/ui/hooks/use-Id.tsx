import React from "react";

export function useId() {
  const id = React.useId();
  return "opencopilot-" + id;
}
