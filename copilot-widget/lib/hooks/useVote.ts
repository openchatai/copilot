import { useAxiosInstance } from "@lib/contexts/axiosInstance";
import useAsyncFn from "./useAsyncFn";

function useUpvote(id: string, onSuccess?: () => void) {
  const axios = useAxiosInstance();
  return useAsyncFn(
    async () =>
      axios.axiosInstance.post<{
        message: string;
      }>(`/chat/vote/${id}`),
    [axios, id, onSuccess]
  );
}

function useDownvote(id: string, onSuccess?: () => void) {
  const axios = useAxiosInstance();
  return useAsyncFn(
    async () =>
      axios.axiosInstance.delete<{
        message: string;
      }>(`/chat/vote/${id}`),
    [axios, id, onSuccess]
  );
}

export { useUpvote, useDownvote };
