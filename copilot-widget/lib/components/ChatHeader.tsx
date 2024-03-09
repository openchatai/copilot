import { useWidgetState } from "../contexts/WidgetState";
import { AlertTriangle, CircleDashed, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./Dialog";
import { Button } from "./Button";
import { useInitialData } from "@lib/hooks/useInitialData";
import { useLang } from "@lib/contexts/LocalesProvider";
import { useConfigData } from "@lib/contexts/ConfigData.tsx";
import { useSocket } from "@lib/contexts/SocketProvider";

function WarnBeforeCloseDialog() {
  const [, , SetState] = useWidgetState();
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
            <DialogClose
              onClick={() => {
                SetState(false);
              }}
            >
              {get("yes-exit")}
            </DialogClose>
          </Button>
          <Button asChild variant="secondary" className="font-semibold">
            <DialogClose>{get("no-cancel")}</DialogClose>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function DisconnedtedAlert() {
  const { state } = useSocket();
  if (state.state === "disconnected") {
    return (
      <div className="bg-rose-200 p-1 px-2 text-rose-500 flex items-start gap-2">
        <AlertTriangle className="text-xl text-rose-800" />
        <span>
          The connection to the server has been lost. Please wait while we try
          to reconnect.
        </span>
      </div>
    );
  }
  return null;
}

function ConnectingAlert() {
  const { state } = useSocket();
  if (state.state === "retrying") {
    return (
      <div className="bg-yellow-200 p-1 px-2 text-yellow-500 flex items-start gap-2">
        <CircleDashed className="text-xl text-yellow-800" />
        <span>
          We are trying to reconnect to the server. Please wait a moment.
        </span>
      </div>
    );
  }
  return null;
}

export default function ChatHeader() {
  const [, , SetState] = useWidgetState();
  const { data } = useInitialData();
  const config = useConfigData();
  return (
    <header className="border-b border-b-black/10 w-full">
      <div className="p-2 w-full flex items-center justify-between">
        <h1 className="font-semibold text-sm">
          {data?.bot_name || "OpenCopilot"}
        </h1>
        <div className="flex items-center gap-3">
          {config?.warnBeforeClose === false ? (
            <button onClick={() => SetState(false)}>
              <X size={20} />
            </button>
          ) : (
            <WarnBeforeCloseDialog />
          )}
        </div>
      </div>
      <div className="alerts w-full text-xs">
        <DisconnedtedAlert />
        <ConnectingAlert />
      </div>
    </header>
  );
}
