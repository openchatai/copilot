import TextareaAutosize from "react-textarea-autosize";
import { SendHorizonal, Redo2 } from "lucide-react";
import { useChat } from "../contexts/Controller";
import { useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ToolTip";
import { getId, isEmpty } from "@lib/utils/utils";
import now from "@lib/utils/timenow";
import { useDocumentDirection } from "@lib/hooks/useDocumentDirection";
import { VoiceRecorder } from "./VoiceRecorder";
import { useInitialData } from "@lib/hooks/useInitialData";

function MessageSuggestions() {
  const { data } = useInitialData();
  const { messages, sendMessage } = useChat();

  return (
    <>
      {isEmpty(messages) && !isEmpty(data?.initial_questions) && (
        <div className="flex no-scrollbar  items-center flex-wrap justify-start gap-2 flex-1">
          {data?.initial_questions?.map((q, index) => (
            <button
              className="text-sm font-medium whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-accent text-primary"
              key={index}
              onClick={() => {
                sendMessage({
                  from: "user",
                  content: q,
                  id: getId(),
                  timestamp: now(),
                });
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
// curl --location 'http://localhost:8888/backend/chat/transcribe' \
// --form 'file=@"/Users/gharbat/Downloads/Neets.ai-example-us-female-2.mp3"'

function ChatInputFooter() {
  const [input, setInput] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, reset, messages } = useChat();
  const { loading } = useChat();
  const canSend = input.trim().length > 0;
  const { direction } = useDocumentDirection();

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
        timestamp: now(),
      });
    }
  }
  return (
    <footer className=" p-2  flex  w-full  flex-col  gap-2">
      <MessageSuggestions />
      <div className="w-full flex items-center ring-[#334155]/60 transition-colors justify-between ring-1 overflow-hidden focus-within:ring-primary gap-2 bg-accent p-2 rounded-2xl">
        <div className=" flex-1">
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
            className=" w-full  resize-none  bg-transparent focus-visible:outline-none border-none focus:outline-none focus:border-none scrollbar-thin leading-tight whitespace-pre-wrap py-1.5 px-4 placeholder:align-middle overflow-auto outline-none text-accent2 text-[14px] placeholder:text-xs font-normal"
          />
        </div>
        <div
          dir={direction}
          className="flex items-center  justify-center  gap-2  h-fit  px-2  text-lg"
        >
          <Tooltip>
            <TooltipTrigger asChild hidden>
              <button
                onClick={reset}
                className=" text-xl disabled: opacity-40 disabled: pointer-events-none disabled: cursor-not-allowed  text-[#5e5c5e]  transition-all"
                disabled={!(messages.length > 0)}
              >
                <Redo2 className="rtl: rotate-180" />
              </button>
            </TooltipTrigger>
            <TooltipContent>reset chat</TooltipContent>
          </Tooltip>
          <VoiceRecorder onSuccess={(text) => setInput(text)} />
          <button
            onClick={handleInputSubmit}
            className="text-xl disabled:opacity-40 disabled: pointer-events-none disabled: cursor-not-allowed  text-[#5e5c5e]  transition-all"
            disabled={loading || !canSend}
          >
            <SendHorizonal className="rtl:rotate-180" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default ChatInputFooter;
