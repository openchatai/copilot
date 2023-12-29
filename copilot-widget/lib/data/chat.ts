import { InitialDataType } from "@lib/types";
import axios, { AxiosInstance } from "axios";

export function createAxiosInstance({
    apiUrl,
    sessionId,
    botToken,
}: {
    apiUrl: string;
    sessionId: string;
    botToken: string;
}) {
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

export async function getInitialData(instance: AxiosInstance) {
    return (await instance.get<InitialDataType>("/chat/init")).data;
}