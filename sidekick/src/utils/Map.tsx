import { ReactNode } from "react";

interface MapProps<T> {
  data: T[];
  render: (item: T, index: number) => ReactNode;
  fallback?: ReactNode;
}

export function Map<T>({ data, render, fallback }: MapProps<T>) {
  if (data.length === 0) {
    return fallback;
  }

  return data.map((item, index) => render(item, index));
}
