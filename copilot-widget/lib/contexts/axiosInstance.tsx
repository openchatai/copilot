import axios, { AxiosInstance } from "axios";
import { ReactNode, createContext, useContext } from "react";
import { useConfigData } from "./ConfigData";

interface AxiosInstanceProps {
  axiosInstance: AxiosInstance;
}
const AxiosContext = createContext<AxiosInstanceProps | undefined>(undefined);
// prefred it separated for the future.
export function AxiosProvider({ children }: { children: ReactNode }) {
  const config = useConfigData();

  const axiosInstance: AxiosInstance = axios.create({
    baseURL: config?.apiUrl,
  });

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
