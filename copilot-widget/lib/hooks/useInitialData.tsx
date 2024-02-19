import { useAxiosInstance } from "@lib/contexts/axiosInstance";
import { getInitialData } from "@lib/data/chat";
import useSWR from "swr";

export function useInitialData() {
  const { axiosInstance } = useAxiosInstance();
  return useSWR("initialData", () => getInitialData(axiosInstance), {revalidateIfStale: false, revalidateOnFocus: false});
}
