import TextareaAutosize from "react-textarea-autosize";
import {
  SendHorizonal,
  Redo2,
  AlertCircle
} from 'lucide-react'
import { useChat } from "../contexts/Controller";
import { useRef, useState } from "react";
import { useInitialData } from "../contexts/InitialDataContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ToolTip";
import { getId, isEmpty } from "@lib/utils/utils";
function MessageSuggestions() {
  const { data } = useInitialData();
  const { messages, sendMessage } = useChat();

  return (
    <>
      {isEmpty(messages) && !isEmpty(data?.inital_questions) && (
        <div className="opencopilot-flex opencopilot-items-center opencopilot-gap-4 opencopilot-justify-between opencopilot-w-full opencopilot-px-4">
          <div className="opencopilot-flex opencopilot-items-center opencopilot-flex-wrap opencopilot-gap-2 opencopilot-flex-1">
            {data?.inital_questions.map((q, index) => (
              <button
                className="opencopilot-text-xs opencopilot-w-fit opencopilot-font-semibold opencopilot-whitespace-nowrap opencopilot-px-2.5 opencopilot-py-1 opencopilot-rounded-full opencopilot-bg-accent opencopilot-text-primary"
                key={index}
                onClick={() => {
                  sendMessage({
                    from: "user",
                    content: q,
                    id: getId(),
                  });
                }}
              >
                {q}
              </button>
            ))}
          </div>
          <Tooltip>
            <TooltipTrigger>
              <span className="opencopilot-text-xl opencopilot-text-primary opencopilot-mb-auto">
                <AlertCircle />
              </span>
            </TooltipTrigger>
            <TooltipContent asChild>
              <span className="opencopilot-text-xs opencopilot-font-medium fade-in-bottom opencopilot-px-2 opencopilot-py-1 opencopilot-mb-3">
                suggestions
              </span>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </>
  );
}

function ChatInputFooter() {
  const [input, setInput] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, reset, messages } = useChat();
  const { loading } = useChat();
  const canSend = input.trim().length > 0;

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.currentTarget.value;
    setInput(value);
  };

  function handleInputSubmit() {
    if (input.trim().length > 0) {
      setInput("");
      sendMessage({
        from: "user",
        content: input,
        id: getId(),
      });
    }
  }
  return (
    <footer className="opencopilot-p-2 opencopilot-flex opencopilot-w-full opencopilot-flex-col opencopilot-gap-2">
      <div className="opencopilot-overflow-y-auto opencopilot-w-full ">
        <MessageSuggestions />
      </div>
      <div className="opencopilot-w-full opencopilot-flex opencopilot-items-center opencopilot-ring-[#334155]/60 opencopilot-transition-colors opencopilot-justify-between opencopilot-ring-1 opencopilot-overflow-hidden focus-within:opencopilot-ring-primary opencopilot-gap-2 opencopilot-bg-accent opencopilot-p-2 opencopilot-rounded-2xl">
        <div className="opencopilot-flex-1">
          <TextareaAutosize
            dir="auto"
            ref={textAreaRef}
            autoFocus={true}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleInputSubmit();
              }
            }}
            disabled={loading}
            maxRows={4}
            rows={1}
            value={input}
            onChange={handleTextareaChange}
            className="opencopilot-w-full opencopilot-resize-none opencopilot-bg-transparent focus-visible:opencopilot-outline-none opencopilot-border-none focus:opencopilot-outline-none focus:opencopilot-border-none opencopilot-scrollbar-thin opencopilot-leading-tight opencopilot-whitespace-pre-wrap opencopilot-py-1.5 opencopilot-px-4 placeholder:opencopilot-align-middle opencopilot-overflow-auto opencopilot-outline-none opencopilot-text-accent2 opencopilot-text-[14px] placeholder:opencopilot-text-xs opencopilot-font-normal"
          />
        </div>
        <div className="opencopilot-flex opencopilot-items-center opencopilot-justify-center opencopilot-gap-2 opencopilot-h-fit opencopilot-px-2 opencopilot-text-lg">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={reset}
                className="opencopilot-text-xl disabled:opencopilot-opacity-40 disabled:opencopilot-pointer-events-none disabled:opencopilot-cursor-not-allowed opencopilot-text-[#5e5c5e] opencopilot-transition-all"
                disabled={!(messages.length > 0)}
              >
                <Redo2 />
              </button>
            </TooltipTrigger>
            <TooltipContent>reset chat</TooltipContent>
          </Tooltip>
          <button
            onClick={handleInputSubmit}
            className="opencopilot-text-xl disabled:opencopilot-opacity-40 disabled:opencopilot-pointer-events-none disabled:opencopilot-cursor-not-allowed opencopilot-text-[#5e5c5e] opencopilot-transition-all"
            disabled={loading || !canSend}
          >
            <SendHorizonal />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default ChatInputFooter;
