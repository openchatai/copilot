import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function UserMessage({ message }: { message: string }) {
  return (
    <div className="flex w-full flex-row items-center justify-end gap-2">
      <p className="w-fit max-w-sm rounded-lg bg-primary px-4 py-2 text-sm text-white">
        {message}
      </p>
    </div>
  );
}
function CopilotMessage({ message }: { message: string }) {
  return (
    <div className="flex w-full flex-row items-center justify-start gap-2">
      <Avatar size="large">
        <AvatarFallback>C</AvatarFallback>
      </Avatar>
      <p className="w-fit max-w-sm rounded-lg bg-[#f4f4f4] px-4 py-2 text-sm text-accent-foreground">
        {message}
      </p>
    </div>
  );
}

export function ChatScreen() {
  return (
    <div className="flex-1 space-y-4 p-4 font-medium overflow-auto">
      <UserMessage message="Hello" />
      <CopilotMessage message="Hello. I am Copilot. How can I help you?" />
      <UserMessage message="I need to submit a complaint" />
      <CopilotMessage message="Ok sure, which method do u prefer, talking to me or filling a form ?" />
      <UserMessage message="Hello" />
      <CopilotMessage message="Hello. I am Copilot. How can I help you?" />
      <UserMessage message="I need to submit a complaint" />
      <CopilotMessage message="Ok sure, which method do u prefer, talking to me or filling a form ?" />
      <UserMessage message="Hello" />
      <CopilotMessage message="Hello. I am Copilot. How can I help you?" />
      <UserMessage message="I need to submit a complaint" />
      <CopilotMessage message="Ok sure, which method do u prefer, talking to me or filling a form ?" />
      <UserMessage message="Hello" />
      <CopilotMessage message="Hello. I am Copilot. How can I help you?" />
      <UserMessage message="I need to submit a complaint" />
      <CopilotMessage message="Ok sure, which method do u prefer, talking to me or filling a form ?" />
    </div>
  );
}
