// https://github.com/samhirtarif/react-audio-recorder/blob/master/src/hooks/useAudioRecorder.ts
import { useState, useCallback } from "react";

export interface recorderControls {
  startRecording: () => void;
  stopRecording: () => void;
  togglePauseResume: () => void;
  recordingBlob?: Blob;
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  mediaRecorder?: MediaRecorder;
}

export type MediaAudioTrackConstraints = Pick<
  MediaTrackConstraints,
  | "deviceId"
  | "groupId"
  | "autoGainControl"
  | "channelCount"
  | "echoCancellation"
  | "noiseSuppression"
  | "sampleRate"
  | "sampleSize"
>;

/**
 * @returns Controls for the recording. Details of returned controls are given below
 *
 * @param `audioTrackConstraints`: Takes a {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings#instance_properties_of_audio_tracks subset} of `MediaTrackConstraints` that apply to the audio track
 * @param `onNotAllowedOrFound`: A method that gets called when the getUserMedia promise is rejected. It receives the DOMException as its input.
 *
 * @details `startRecording`: Calling this method would result in the recording to start. Sets `isRecording` to true
 * @details `stopRecording`: This results in a recording in progress being stopped and the resulting audio being present in `recordingBlob`. Sets `isRecording` to false
 * @details `togglePauseResume`: Calling this method would pause the recording if it is currently running or resume if it is paused. Toggles the value `isPaused`
 * @details `recordingBlob`: This is the recording blob that is created after `stopRecording` has been called
 * @details `isRecording`: A boolean value that represents whether a recording is currently in progress
 * @details `isPaused`: A boolean value that represents whether a recording in progress is paused
 * @details `recordingTime`: Number of seconds that the recording has gone on. This is updated every second
 * @details `mediaRecorder`: The current mediaRecorder in use
 */
const useAudioRecorder: (
  audioTrackConstraints?: MediaAudioTrackConstraints,
  onNotAllowedOrFound?: (exception: DOMException) => any,
  mediaRecorderOptions?: MediaRecorderOptions
) => recorderControls = (
  audioTrackConstraints,
  onNotAllowedOrFound,
  mediaRecorderOptions
) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timer>();
  const [recordingBlob, setRecordingBlob] = useState<Blob>();

  const _startTimer: () => void = useCallback(() => {
    const interval = setInterval(() => {
      setRecordingTime((time) => time + 1);
    }, 1000);
    setTimerInterval(interval);
  }, [setRecordingTime, setTimerInterval]);

  const _stopTimer: () => void = useCallback(() => {
    // @ts-ignore
    timerInterval != null && clearInterval(timerInterval);
    setTimerInterval(undefined);
  }, [timerInterval, setTimerInterval]);

  /**
   * Calling this method would result in the recording to start. Sets `isRecording` to true
   */
  const startRecording: () => void = useCallback(() => {
    if (timerInterval != null) return;

    navigator.mediaDevices
      .getUserMedia({ audio: audioTrackConstraints ?? true })
      .then((stream) => {
        setIsRecording(true);
        const recorder: MediaRecorder = new MediaRecorder(
          stream,
          mediaRecorderOptions
        );
        setMediaRecorder(recorder);
        recorder.start();
        _startTimer();

        recorder.addEventListener("dataavailable", (event) => {
          setRecordingBlob(event.data);
          recorder.stream.getTracks().forEach((t) => t.stop());
          setMediaRecorder(undefined);
        });
      })
      .catch((err: DOMException) => {
        onNotAllowedOrFound?.(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timerInterval,
    setIsRecording,
    setMediaRecorder,
    _startTimer,
    setRecordingBlob,
    onNotAllowedOrFound,
    mediaRecorderOptions,
  ]);

  /**
   * Calling this method results in a recording in progress being stopped and the resulting audio being present in `recordingBlob`. Sets `isRecording` to false
   */
  const stopRecording: () => void = useCallback(() => {
    mediaRecorder?.stop();
    _stopTimer();
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
  }, [
    mediaRecorder,
    setRecordingTime,
    setIsRecording,
    setIsPaused,
    _stopTimer,
  ]);

  /**
   * Calling this method would pause the recording if it is currently running or resume if it is paused. Toggles the value `isPaused`
   */
  const togglePauseResume: () => void = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      mediaRecorder?.resume();
      _startTimer();
    } else {
      setIsPaused(true);
      _stopTimer();
      mediaRecorder?.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaRecorder, setIsPaused, _startTimer, _stopTimer]);

  return {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
    recordingTime,
    mediaRecorder,
  };
};

export default useAudioRecorder;
