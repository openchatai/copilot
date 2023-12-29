import { Message } from "@lib/types"
import { HistoryMessage } from "@lib/types/initialDataType"

export function historyToMessages(history?: HistoryMessage[]): Message[] {
    const $messages: Message[] = [];

    if (history) {
        history.forEach((m) => {
            if (m.from_user) {
                $messages.push({
                    from: "user",
                    content: m.message,
                    id: m.id,
                    timestamp: new Date(m.created_at),
                })
            } else {
                $messages.push({
                    from: "bot",
                    id: m.id,
                    timestamp: new Date(m.created_at),
                    type: "text",
                    response: {
                        text: m.message
                    }
                })
            }
        })
    }
    return $messages
}