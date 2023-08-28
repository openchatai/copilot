"use client";
import { ThemeProvider as NextThemeProvider } from "next-themes";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemeProvider attribute="class" themes={["light", "dark"]}>
      {children}
    </NextThemeProvider>
  );
}
