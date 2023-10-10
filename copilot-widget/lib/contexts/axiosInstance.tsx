import axios, { AxiosInstance } from "axios";
import { ReactNode, createContext, useContext, useMemo } from "react";
import { useConfigData } from "./ConfigData";
import { useSessionId } from "@lib/hooks/useSessionId";

interface AxiosInstanceProps {
  axiosInstance: AxiosInstance;
}

function createAxiosInstance(apiUrl?: string, sessionId?: string) {
  const instance = axios.create({
    baseURL: apiUrl,
    headers: {
      "X-Session-Id": sessionId,
    },
  });

  instance.interceptors.request.use((config) => {
    config.data = {
      ...config.data,
      session_id: sessionId,
    };
    return config;
  });
  return instance;
}

const AxiosContext = createContext<AxiosInstanceProps | undefined>(undefined);
// prefred it separated for the future.
export function AxiosProvider({ children }: { children: ReactNode }) {
  const config = useConfigData();
  const { sessionId } = useSessionId();
  const axiosInstance: AxiosInstance = useMemo(
    () => createAxiosInstance(config?.apiUrl, sessionId),
    [config, sessionId]
  );

  if (config?.token) {
    axiosInstance.defaults.headers["X-Bot-Token"] = config?.token;
  } else {
    console.warn("No token!");
  }

  return (
    <AxiosContext.Provider value={{ axiosInstance }}>
      {children}
    </AxiosContext.Provider>
  );
}

export const useAxiosInstance = (): AxiosInstanceProps => {
  const context = useContext(AxiosContext);
  if (!context) {
    throw new Error("useAxiosInstance must be used within a AxiosProvider");
  }
  return context;
};
