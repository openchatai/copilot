import { type LangType, getStr } from "@lib/locales";
import { createSafeContext } from "./create-safe-context";
import { useConfigData } from "./ConfigData";

const [useLang, SafeLanguageProvider] = createSafeContext<{
  get: (key: string) => string;
  lang: LangType;
}>();

function LanguageProvider({ children }: { children: React.ReactNode }) {
  const config = useConfigData();
  console.log(config);
  return (
    <SafeLanguageProvider
      value={{
        get: (key: string) => getStr(key, config.language ?? "en"),
        lang: config.language ?? "en",
      }}
    >
      {children}
    </SafeLanguageProvider>
  );
}
export { LanguageProvider, useLang };
