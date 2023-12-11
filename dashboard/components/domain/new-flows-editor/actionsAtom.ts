import { atom, useAtom } from "jotai"

const initialActions = [
    {
        id: "1",
        name: "Action 1",
        description: "This is action 1",
        type: "action",
    }, {
        id: "2",
        name: "Action 2",
        description: "This is action 2",
        type: "action",
    }, {
        id: "3",
        name: "Action 3",
        description: "This is action 3",
        type: "action",
    }, {
        id: "4",
        name: "Action 4",
        description: "This is action 4",
        type: "action",
    },
]
const actionsAtom = atom(initialActions)
export const useActions = () => useAtom(actionsAtom)
export type Action = typeof initialActions[0];