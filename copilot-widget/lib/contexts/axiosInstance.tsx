import axios, { AxiosInstance } from "axios";
import { ReactNode, createContext, useContext } from "react";
import { useConfigData } from "./ConfigData";
import { useSessionId } from "@lib/hooks/useSessionId";

interface AxiosInstanceProps {
  axiosInstance: AxiosInstance;
}

function createAxiosInstance(apiUrl?: string, sessionId?: string | null, botToken?: string) {
  const instance = axios.create({
    baseURL: apiUrl,
    headers: {
      "X-Session-Id": sessionId,
      "X-Bot-Token": botToken,
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
  const { sessionId } = useSessionId(config?.token || 'defaultToken');
  const axiosInstance: AxiosInstance = createAxiosInstance(config?.apiUrl, sessionId, config?.token);

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
