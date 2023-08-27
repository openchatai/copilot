import { BiX } from "react-icons/bi";
import { useWidgetStateContext } from "../contexts/WidgetState";

export default function ChatHeader() {
  const [,toggle] = useWidgetStateContext()
  return (
    <header className="opencopilot-fade-in-top opencopilot-border-b opencopilot-border-b-black/10 opencopilot-w-full">
      <div className="opencopilot-p-3">
        <div className="opencopilot-w-full opencopilot-flex opencopilot-items-center opencopilot-justify-between">
          <div><h1 className="opencopilot-font-semibold opencopilot-text-sm">OpenPilot</h1></div>
          <div className="opencopilot-flex opencopilot-items-center opencopilot-gap-3">
            <button onClick={toggle}><BiX size={19}/></button>
          </div>
        </div>
      </div>
    </header>
  );
}
