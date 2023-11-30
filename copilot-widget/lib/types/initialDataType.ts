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