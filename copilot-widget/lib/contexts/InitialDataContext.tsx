import {
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { useAxiosInstance } from "./axiosInstance";
import { InitialDataType } from "@lib/types";
import { getInitialData } from "@lib/data/chat";
import { createSafeContext } from "./create-safe-context";

type InitialDataContextType = {
  data: InitialDataType | undefined;
  loading: boolean;
  refetch: () => void;
};

const [
  useInitialData,
  InitialDataSafeProvider,
] = createSafeContext<InitialDataContextType>();



function InitialDataProvider({ children }: { children: ReactNode }) {
  const { axiosInstance } = useAxiosInstance();
  const [data, setData] = useState<InitialDataType | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  console.log(data)
  function loadData() {
    setLoading(true);
    getInitialData(axiosInstance)
      .then((data) => setData(data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <InitialDataSafeProvider
      value={{
        data,
        loading,
        refetch: loadData,
      }}
    >
      {children}
    </InitialDataSafeProvider>
  );
}
export {
  // eslint-disable-next-line react-refresh/only-export-components
  useInitialData,
  InitialDataProvider,
}