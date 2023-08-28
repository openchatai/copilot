export interface InitialDataType {
    bot_name: string;
    logo: string;
    sound_effects: {
        submit: string;
        response: string;
    };
    inital_questions: string[];
}