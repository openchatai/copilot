import { useWidgetState } from "../contexts/WidgetState";
import { AlertTriangle, X } from "lucide-react";
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

export default function ChatHeader() {
  const [, , SetState] = useWidgetState();
  const { data } = useInitialData();
  const { get } = useLang();
  return (
    <header className="p-3 border-b border-b-black/10 w-full">
      <div className=" w-full flex items-center justify-between">
        <h1 className="font-semibold text-sm">
          {data?.bot_name || "opencopilot"}
        </h1>
        <div className=" flex items-center gap-3">
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
                  <h2>
                    {get("are-you-sure")}
                  </h2>
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
        </div>
      </div>
    </header>
  );
}
