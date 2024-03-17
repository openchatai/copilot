import { ReactNode } from "react";
type RenderFunction<T> = (item: T, index: number) => ReactNode;

interface MapProps<T> {
  data: T[];
  render: RenderFunction<T>;
  fallback?: ReactNode;
}

export function Map<T>({ data, render, fallback }: MapProps<T>) {
  if (typeof render !== "function") {
    throw new Error("render function is required");
  }

  if (data.length === 0) {
    return fallback || null;
  }

  return data.map((item, index) => render(item, index));
}
