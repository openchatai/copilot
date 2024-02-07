import { getStr } from "@lib/locales";
import { createSafeContext } from "./create-safe-context";
import { useConfigData } from "./ConfigData";

const [useLang, SafeLanguageProvider] = createSafeContext();

function LanguageProvider({ children }: { children: React.ReactNode }) {
  const config = useConfigData();
  return (
    <SafeLanguageProvider
      value={{
        get: (key: string) => getStr(key, config.lang ?? "en"),
        lang: config.lang ?? "en",
      }}
    >
      {children}
    </SafeLanguageProvider>
  );
}
export { LanguageProvider, useLang };
