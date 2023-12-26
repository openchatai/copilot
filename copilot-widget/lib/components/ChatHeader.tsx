import { useWidgetState } from "../contexts/WidgetState";
import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./Dialog";
import { useInitialData } from "@lib/contexts/InitialDataContext";

export default function ChatHeader() {
  const [, , SetState] = useWidgetState();
  const {
    data
  } = useInitialData();
  return (
    <header className="opencopilot-fade-in-top opencopilot-p-3 opencopilot-border-b opencopilot-border-b-black/10 opencopilot-w-full">
      <div className="opencopilot-w-full opencopilot-flex opencopilot-items-center opencopilot-justify-between">
        <h1 className="opencopilot-font-semibold opencopilot-text-sm">
          {data?.bot_name}
        </h1>
        <div className="opencopilot-flex opencopilot-items-center opencopilot-gap-3">
          <Dialog>
            <DialogTrigger>
              <X size={20} />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="opencopilot-mx-auto">Are you sure?</DialogHeader>
              <div className="opencopilot-space-y-1.5">
                <DialogClose
                  onClick={() => {
                    // Close the widget after 500ms, IDK why but it solves the focus trap issue
                    setTimeout(() => {
                      SetState(false);
                    }, 100);
                  }}
                  className="opencopilot-block opencopilot-w-full opencopilot-px-2 opencopilot-text-white opencopilot-py-1 opencopilot-rounded-md !opencopilot-bg-rose-500"
                >
                  <span>Exit</span>
                </DialogClose>
                <DialogClose className="opencopilot-block opencopilot-w-full opencopilot-px-2 opencopilot-py-1 opencopilot-rounded-md opencopilot-text-black">
                  <span>Cancel</span>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
