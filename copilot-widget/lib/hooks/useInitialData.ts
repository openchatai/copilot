import { useAxiosInstance } from "@lib/contexts/axiosInstance";
import { getInitialData } from "@lib/data/chat";
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
