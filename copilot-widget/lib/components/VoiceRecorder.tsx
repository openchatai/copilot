import { MicIcon, Square } from "lucide-react";
import { useAxiosInstance } from "@lib/contexts";
import { now } from "@lib/utils/time";
import { useEffect } from "react";
import { useAudioRecorder } from "@lib/hooks";
import cn from "@lib/utils/cn";

export function VoiceRecorder({
  onSuccess,
  disabled,
}: {
  onSuccess?: (text: string) => void;
  disabled?: boolean;
}) {
  const { axiosInstance } = useAxiosInstance();
  const { startRecording, stopRecording, isRecording, recordingBlob } =
    useAudioRecorder({
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
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center justify-center shrink-0 rounded-full size-6 [&>svg]:size-4",
        disabled ? "bg-rose-500" : "bg-emerald-500"
      )}
    >
      {isRecording ? (
        <Square strokeLinecap="round" className="text-accent size-[1em]" />
      ) : (
        <MicIcon strokeLinecap="round" className="text-white size-[1em]" />
      )}
    </button>
  );
}
