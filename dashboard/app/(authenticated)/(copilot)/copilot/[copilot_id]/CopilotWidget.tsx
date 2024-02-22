import { Button } from '@/components/ui/button';
import { baseUrl } from '@/data/base-url';
import {
    CopilotWidget,
    Root
} from '@openchatai/copilot-widget';
import { ErrorBoundary } from "react-error-boundary";
export default function Widget({
    token
}: {
    token: string
}) {
    return <ErrorBoundary FallbackComponent={({ resetErrorBoundary }) => {
        return <div className="flex flex-col items-center justify-center h-full">
            <div className="flex flex-col gap-3 items-center justify-center">
                <h1 className="text-2xl font-semibold text-gray-700">Something went wrong</h1>
                <Button onClick={() => resetErrorBoundary()} variant='destructive'>Try again</Button>
            </div>
        </div>
    }}>

        <Root
            options={{
                apiUrl: baseUrl + "/backend",
                socketUrl: baseUrl,
                defaultOpen: true,
                token,
                initialMessage: "Hey Pal!",
                headers: {
                    "X-Copilot": "copilot"
                },
            }}
            containerProps={{
                className: "border rounded-lg overflow-hidden",
            }}
        >
            <CopilotWidget triggerSelector="#triggerSelector" />
        </Root>
    </ErrorBoundary>
}