import TextareaAutosize from "react-textarea-autosize";
import { SendHorizonal, AlertTriangle, RotateCcw } from "lucide-react";
import { useChat } from "../contexts/Controller";
import { useRef, useState } from "react";
import { getId, isEmpty } from "@lib/utils/utils";
import now from "@lib/utils/timenow";
import { useDocumentDirection } from "@lib/hooks/useDocumentDirection";
import { VoiceRecorder } from "./VoiceRecorder";
import { useInitialData } from "@lib/hooks/useInitialData";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./Dialog";
import { Button } from "./Button";
import { useLang } from "@lib/contexts/LocalesProvider";

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
function ResetButtonWithConfirmation() {
  const { reset } = useChat();
  const [open, setOpen] = useState(false);
  const { get } = useLang();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <RotateCcw size={20} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto flex flex-col items-center justify-center">
            <span className="text-rose-500">
              <AlertTriangle className="size-10" />
            </span>
            <h2>{get("are-you-sure")}</h2>
          </div>
        </DialogHeader>
        <div className="flex flex-row items-center justify-center gap-2">
          <Button
            asChild
            variant="destructive"
            className="font-semibold"
            onClick={reset}
          >
            <DialogClose>{get("yes-reset")}</DialogClose>
          </Button>
          <Button asChild variant="secondary" className="font-semibold">
            <DialogClose>{get("no-cancel")}</DialogClose>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function ChatInputFooter() {
  const [input, setInput] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage } = useChat();
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
    <footer className="p-2 flex w-full flex-col gap-2">
      <MessageSuggestions />
      <div className="w-full flex items-center ring-[#334155]/60 transition-colors justify-between ring-1 overflow-hidden focus-within:ring-primary gap-2 bg-accent p-2 rounded-2xl">
        <div className="flex-1">
          <TextareaAutosize
            dir="auto"
            ref={textAreaRef}
            autoFocus={true}
            placeholder="_"
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
            className=" w-full resize-none bg-transparent focus-visible:outline-none border-none focus:outline-none focus:border-none scrollbar-thin leading-tight whitespace-pre-wrap py-1.5 px-4 placeholder:align-middle overflow-auto outline-none text-accent2 text-[14px] placeholder:text-xs font-normal"
          />
        </div>
        <div
          dir={direction}
          className="flex items-center justify-center gap-2 h-fit px-2 text-lg"
        >
          <ResetButtonWithConfirmation />
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
