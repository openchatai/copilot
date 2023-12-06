import axios, { AxiosInstance } from "axios";

export type SessionIdType = `${string}:${string}`;
const SESSION_ID_HEADER = "X-Session-Id";
const COPILOT_TOKEN_HEADER = "X-Bot-Token";

let instance: AxiosInstance;

export function createInstance(copilotToken: string, sessionId: SessionIdType, baseUrl: string) {
    // make sure we only have one instance
    if (instance) {
        return instance;
    }
    instance = axios.create({
        baseURL: baseUrl,
        headers: {
            [SESSION_ID_HEADER]: sessionId,
            [COPILOT_TOKEN_HEADER]: copilotToken,
        },
    });
    return instance;
}

export function getInitialData(instance: AxiosInstance) {
    return instance.get<InitialDataType>("/chat/init");
}

export function sendMessage(instance: AxiosInstance, message: string) {
    return instance.post<HistoryMessage>("/chat/send", { message });
}

export type HistoryMessage = {
    chatbot_id: string;
    created_at: string;
    from_user: boolean;
    id: number;
    message: string;
    session_id: string;
    updated_at: string;
};

export interface InitialDataType {
    bot_name: string;
    logo: string;
    history: HistoryMessage[];
    sound_effects: {
        submit: string;
        response: string;
    };
    inital_questions: string[];
}
