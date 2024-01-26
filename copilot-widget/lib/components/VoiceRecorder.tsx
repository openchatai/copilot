import { useAudioRecorder } from "react-audio-voice-recorder";
import { Square, MicIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ToolTip";
export function VoiceRecorder({
  onStopRecording,
}: {
  onStopRecording?: (blob: Blob) => void;
}) {
  const {
    startRecording,
    stopRecording,
    isRecording,
    recordingTime,
    recordingBlob,
  } = useAudioRecorder({
    noiseSuppression: true,
    echoCancellation: true,
  });
  function handleClick() {
    if (isRecording) {
      stopRecording();
      if (recordingBlob) {
        onStopRecording?.(recordingBlob);
      }
    } else {
      startRecording();
    }
  }

  return (
    <Tooltip open={isRecording}>
      <TooltipContent sideOffset={5} side="top">
        Recording {recordingTime}s
      </TooltipContent>
      <TooltipTrigger asChild>
        <button
          onClick={handleClick}
          className="opencopilot-flex opencopilot-items-center opencopilot-justify-center opencopilot-shrink-0 opencopilot-bg-emerald-500 opencopilot-rounded-full opencopilot-size-6 [&>svg]:opencopilot-size-4"
        >
          {isRecording ? (
            <Square strokeLinecap="round" className="opencopilot-text-accent" />
          ) : (
            <MicIcon strokeLinecap="round" className="opencopilot-text-white" />
          )}
        </button>
      </TooltipTrigger>
    </Tooltip>
  );
}
