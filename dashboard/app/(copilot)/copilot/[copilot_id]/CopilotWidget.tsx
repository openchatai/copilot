import {
    CopilotWidget,
    Root
} from '@openchatai/copilot-widget';
export default function Widget({
    token
}: {
    token: string
}) {
    return <Root
        options={{
            apiUrl: "http://localhost:8888/backend/api",
            defaultOpen: true,
            token,
            initialMessage: "Hey Pal!",
            headers: {
                "X-Copilot": "copilot"
            },
        }}
    >
        <div className="[&>div]:static [&>div]:!max-h-full [&>div]:!h-full h-full overflow-hidden [&>div]:!border-border [&>div]:!border rounded-lg">
            <CopilotWidget
                triggerSelector="#triggerSelector"
            />
        </div>
    </Root>
}