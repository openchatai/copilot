import { HistoryMessage, SessionIdType } from "./data";
import { radnom } from "./rand";
import { Singleton } from "./singleton";


export class Chat extends Singleton {
    // singleTon
    private sessionId?: SessionIdType;
    history: HistoryMessage[] = [];
    copilotToken: string;
    constructor(copilotToken: string) {
        super()
        this.copilotToken = copilotToken;
        this.init()
    }
    init() {

    }

    get getSessionId(): SessionIdType {
        if (!this.sessionId) {
            this.setSessionId(this.generateSessionId())
        }
        return this.sessionId!;
    }
    setSessionId(sessionId: SessionIdType) {
        this.sessionId = sessionId;
    }
    generateSessionId(): SessionIdType {
        const sessionId = radnom() + ":" + this.copilotToken;
        return sessionId as SessionIdType;
    }
}


