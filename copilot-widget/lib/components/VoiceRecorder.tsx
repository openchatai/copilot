import { useAudioRecorder } from "react-audio-voice-recorder";
import { Square, MicIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ToolTip";
import { useAxiosInstance } from "@lib/contexts/axiosInstance";
import now from "@lib/utils/timenow";
import { useEffect } from "react";

export function VoiceRecorder({
  onSuccess,
}: {
  onSuccess?: (text: string) => void;
}) {
  const { axiosInstance } = useAxiosInstance();

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
  useEffect(() => {
    async function transcribe() {
      if (recordingBlob && !isRecording) {
        const { data } = await axiosInstance.postForm<{ text: string }>(
          "/chat/transcribe",
          {
            file: new File([recordingBlob], now() + ".mp3", {
              type: "audio/mp3",
            }),
          }
        );
        if (data) {
          onSuccess && onSuccess(data.text);
        }
      }
    }
    transcribe();
  }, [recordingBlob]);
  async function handleClick() {
    if (isRecording) {
      stopRecording();
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
