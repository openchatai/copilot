import { useAxiosInstance } from "@lib/contexts";
import { getInitialData } from "@lib/data";
import useSWR from "swr";

export function useInitialData() {
  const { axiosInstance, sessionId } = useAxiosInstance();
  return useSWR(
    [sessionId, "initialData"].join("-"),
    () => getInitialData(axiosInstance),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    }
  );
}
