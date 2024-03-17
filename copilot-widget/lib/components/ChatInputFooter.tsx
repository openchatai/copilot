import TextareaAutosize from "react-textarea-autosize";
import { AlertTriangle, RotateCcw, SendHorizonal } from "lucide-react";
import { useRef, useState } from "react";
import { isEmpty } from "@lib/utils/utils";
import {
  useCanSend,
  useChatState,
  useDocumentDirection,
  useInitialData,
  useSendMessage,
} from "@lib/hooks";
import { VoiceRecorder } from "./VoiceRecorder";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./Dialog";
import { Button } from "./Button";
import { useLang, useMessageHandler } from "@lib/contexts";
import cn from "@lib/utils/cn";

function MessageSuggestions() {
  const { data } = useInitialData();
  const { messages } = useChatState();
  const { send } = useSendMessage();

  return (
    <>
      {isEmpty(messages) && !isEmpty(data?.initial_questions) && (
        <div className="flex no-scrollbar  items-center flex-wrap justify-start gap-2 flex-1">
          {data?.initial_questions?.map((q, index) => (
            <button
              className="text-xs font-medium whitespace-nowrap px-2 py-1 rounded-lg bg-accent text-primary"
              key={index}
              onClick={() => {
                send(q);
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
  const { __handler: mh } = useMessageHandler();
  const [open, setOpen] = useState(false);
  const { get } = useLang();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <RotateCcw className="size-[1em]" />
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
            onClick={mh.reset}
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

export function ChatInputFooter() {
  const [input, setInput] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { send } = useSendMessage();
  const { direction } = useDocumentDirection();
  const { canSend } = useCanSend({ input });

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.currentTarget.value;
    setInput(value);
  };

  function handleInputSubmit() {
    if (canSend) {
      setInput("");
      send(input);
    }
  }

  return (
    <footer className="p-2 flex w-full flex-col gap-2">
      <MessageSuggestions />
      <div
        className={cn(
          "w-full flex items-center transition-colors focus-within:ring-primary ring-[#334155]/60 justify-between ring-1 overflow-hidden gap-2 bg-accent p-2 rounded-2xl"
        )}
      >
        <div className="flex-1">
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
            maxRows={4}
            rows={1}
            value={input}
            onChange={handleTextareaChange}
            className=" w-full resize-none bg-transparent focus-visible:outline-none border-none focus:outline-none focus:border-none scrollbar-thin leading-tight whitespace-pre-wrap py-1.5 px-4 placeholder:align-middle overflow-auto outline-none text-accent2 text-[14px] placeholder:text-xs font-normal"
          />
        </div>
        <div
          dir={direction}
          className="flex items-center justify-center gap-2 h-fit px-2 text-base"
        >
          <ResetButtonWithConfirmation />
          <VoiceRecorder onSuccess={(text) => setInput(text)} />
          <button
            onClick={handleInputSubmit}
            id="send_chat_button"
            disabled={!canSend}
            className={cn(
              "disabled:pointer-events-none disabled:cursor-not-allowed transition-all",
              !canSend ? "text-rose-500" : " text-[#5e5c5e]"
            )}
          >
            <SendHorizonal className="rtl:rotate-180 size-[1em]" />
          </button>
        </div>
      </div>
    </footer>
  );
}
