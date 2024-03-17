import { useConfigData, useLang, useWidgetState } from "@lib/contexts";
import { AlertTriangle, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./Dialog";
import { Button } from "./Button";
import { useInitialData } from "@lib/hooks";

function WarnBeforeCloseDialog({ onClose }: { onClose: () => void }) {
  const { get } = useLang();

  return (
    <Dialog>
      <DialogTrigger>
        <X size={20} />
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
          <Button asChild variant="destructive" className="font-semibold">
            <DialogClose onClick={onClose}>{get("yes-exit")}</DialogClose>
          </Button>
          <Button asChild variant="secondary" className="font-semibold">
            <DialogClose>{get("no-cancel")}</DialogClose>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ChatHeader() {
  const [, , SetState] = useWidgetState();
  const { data } = useInitialData();
  const config = useConfigData();
  const debug = config.debug ?? false;

  const onClose = () => {
    SetState(false);

    if (config.onClose !== undefined) {
      config.onClose();
    }
  };

  return (
    <header className="border-b border-b-black/10 w-full">
      <div className="p-2 w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-sm">
            {data?.bot_name || "OpenCopilot"}
          </h1>
          {debug && (
            <span className="py-0.5 px-1 bg-primary font-semibold text-[10px] rounded-lg text-white">
              DEBUG
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {config?.warnBeforeClose === false ? (
            <button onClick={onClose}>
              <X size={20} />
            </button>
          ) : (
            <WarnBeforeCloseDialog onClose={onClose} />
          )}
        </div>
      </div>
    </header>
  );
}
