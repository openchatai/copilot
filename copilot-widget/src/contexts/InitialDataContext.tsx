import {
  createContext,
  useContext,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { useAxiosInstance } from "./axiosInstance";
import { type InitialDataType } from "../lib/types";

type InitialDataContextType = {
  data: InitialDataType | undefined;
  loading: boolean;
  refetch: () => void;
};

const InitialDataContext = createContext<InitialDataContextType | undefined>(
  undefined
);

export function InitialDataProvider({ children }: { children: ReactNode }) {
  const { axiosInstance } = useAxiosInstance();
  const [data, setData] = useState<InitialDataType | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  async function loadData() {
    setLoading(true);
    axiosInstance
      .get<InitialDataType>("/chat/init")
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <InitialDataContext.Provider
      value={{
        data,
        loading,
        refetch: loadData,
      }}
    >
      {children}
    </InitialDataContext.Provider>
  );
}

export const useInitialData = (): InitialDataContextType | undefined => {
  const context = useContext(InitialDataContext);
  if (!context) {
    console.warn("Error loading initial data....");
  }
  return context;
};
