import { AxiosInstance } from "axios";
import { ReactNode, useMemo } from "react";
import { useConfigData } from "./ConfigData";
import { useSessionId } from "@lib/hooks/useSessionId";
import { createAxiosInstance } from "@lib/data/chat";
import { createSafeContext } from "./create-safe-context";

interface AxiosInstanceProps {
  axiosInstance: AxiosInstance;
}

const [
  useAxiosInstance,
  AxiosSafeProvider,
] = createSafeContext<AxiosInstanceProps>();

function AxiosProvider({ children }: { children: ReactNode }) {
  const config = useConfigData();
  const { sessionId } = useSessionId(config?.token || 'defaultToken');
  const axiosInstance: AxiosInstance = useMemo(() => {
    return createAxiosInstance({
      botToken: config?.token,
      sessionId,
      apiUrl: config?.apiUrl,
    });
  }, [config, sessionId]);

  return (
    <AxiosSafeProvider value={{ axiosInstance }}>
      {children}
    </AxiosSafeProvider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { useAxiosInstance, AxiosProvider };