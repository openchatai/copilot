import { AxiosInstance } from "axios";
import { ReactNode, useMemo } from "react";
import { useConfigData } from "./ConfigData";
import { createAxiosInstance } from "@lib/data";
import { createSafeContext } from "./createSafeContext";

interface AxiosInstanceProps {
  axiosInstance: AxiosInstance;
  sessionId: string;
}

function randomString(length = 10) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

const [useAxiosInstance, AxiosSafeProvider] =
  createSafeContext<AxiosInstanceProps>();

function AxiosProvider({ children }: { children: ReactNode }) {
  const { token, apiUrl } = useConfigData();
  const sessionId = useMemo(() => token + "|" + randomString(), [token]);

  const axiosInstance: AxiosInstance = useMemo(() => {
    return createAxiosInstance({
      botToken: token,
      sessionId,
      apiUrl: apiUrl,
    });
  }, [token, apiUrl, sessionId]);
  return (
    <AxiosSafeProvider value={{ axiosInstance, sessionId }}>
      {children}
    </AxiosSafeProvider>
  );
}

export { useAxiosInstance, AxiosProvider };
