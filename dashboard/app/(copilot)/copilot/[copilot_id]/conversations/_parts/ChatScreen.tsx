import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function UserMessage({ message }: { message: string }) {
  return (
    <div className="flex w-full flex-row items-center justify-end gap-2">
      <p className="w-fit max-w-sm rounded-lg bg-primary px-4 py-3 text-sm text-white">
        {message}
      </p>
    </div>
  );
}
function CopilotMessage({ message }: { message: string }) {
  return (
    <div className="flex w-full flex-row items-center justify-start gap-2">
      <Avatar size="large" className="sticky top-0">
        <AvatarFallback>C</AvatarFallback>
      </Avatar>
      <p className="w-fit max-w-sm rounded-lg bg-secondary px-4 py-3 text-sm text-accent-foreground">
        {message}
      </p>
    </div>
  );
}
function ChatDivider({ content }: { content: string }) {
  return (
    <div className="relative my-4 block h-px w-full bg-secondary">
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs">
        {content}
      </span>
    </div>
  );
}

export function ChatScreen() {
  return (
    <div className="flex-1 space-y-3 overflow-auto p-4 font-medium">
      <UserMessage message="Hello" />
      <CopilotMessage message="Hello. I am Copilot. How can I help you?" />
      <UserMessage message="I need to submit a complaint" />
      <CopilotMessage message="Ok sure, which method do u prefer, talking to me or filling a form ?" />
      <UserMessage message="Talking to you" />
      <CopilotMessage message="Ok, please tell me your complaint" />
      <UserMessage message="I have a problem with my order" />
      <CopilotMessage message="Ok, please tell me your order number" />
      <UserMessage message="123456789" />
      <CopilotMessage message="Oh i see, looks like the address is wrong." />
      <CopilotMessage message="Please confirm your address" />
      <UserMessage message="123, Main Street, New York" />
      <CopilotMessage message="Ok, I have updated your address." />
      <UserMessage message="Thank you" />
      <ChatDivider content="Conversation Ended" />
    </div>
  );
}
