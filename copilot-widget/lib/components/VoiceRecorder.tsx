import { Square, MicIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ToolTip";
import { useAxiosInstance } from "@lib/contexts/axiosInstance";
import now from "@lib/utils/timenow";
import { useEffect } from "react";
import useAudioRecorder from "@lib/hooks/useAudioRecord";
import { useLang } from "@lib/contexts/LocalesProvider";

export function VoiceRecorder({
  onSuccess,
}: {
  onSuccess?: (text: string) => void;
}) {
  const { axiosInstance } = useAxiosInstance();
  const { get } = useLang();
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
        {get("recording")} {recordingTime}s
      </TooltipContent>
      <TooltipTrigger asChild>
        <button
          onClick={handleClick}
          className="flex items-center justify-center shrink-0 bg-emerald-500 rounded-full size-6 [&>svg]:size-4"
        >
          {isRecording ? (
            <Square strokeLinecap="round" className="text-accent" />
          ) : (
            <MicIcon strokeLinecap="round" className="text-white" />
          )}
        </button>
      </TooltipTrigger>
    </Tooltip>
  );
}
