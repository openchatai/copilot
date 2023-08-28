import axios, { AxiosRequestConfig, type AxiosInstance } from "axios";
import { useState } from "react";
import { useStatus } from "./use-Status";

export function useAxios<TData>({
    instance,
    config,
}: {
    instance?: AxiosInstance;
    config: AxiosRequestConfig;
}) {
    const [status, setStatus, is] = useStatus("idle")
    const [data, setData] = useState<TData>();
    const [error, setError] = useState<Error | null>();
    const ax = instance || axios;

    const begin = async (args?: { reqConfig?: AxiosRequestConfig }) => {
        setStatus("pending");
        setError(null);
        return ax(args?.reqConfig ? args.reqConfig : config)
            .then((res) => {
                setData(res.data);
                setStatus("resolved");
                return res
            })
            .catch((err) => {
                setStatus("rejected");
                setError(err);
            })
    }

    return { data, error, begin, isLoading: is("pending") || is("idle"), isResolved: is("resolved"), isRejected: is('rejected'), status };
}