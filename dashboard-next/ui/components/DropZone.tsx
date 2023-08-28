"use client";
import React, {
  type ComponentPropsWithoutRef,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";

import {
  useDropzone,
  type DropzoneOptions,
  type FileRejection,
  type DropEvent,
} from "react-dropzone";

import {
  AiOutlineFilePdf,
  AiOutlineFileText,
  AiOutlineFileUnknown,
} from "react-icons/ai";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ToolTip";
import { humanizeFileSize, parseFileName, truncateString } from "utils/misc";
import { BsFiletypeJson } from "react-icons/bs";
import { Button } from "./Button";
import { BiRefresh } from "react-icons/bi";

function FilePreviewRenderer({ file }: { file: File }) {
  function getFileIcon() {
    switch (file.type) {
      case "application/pdf":
        return (
          <div className="h-15 w-fit text-red-500 dark:text-red-700 flex-center text-2xl">
            <AiOutlineFilePdf />
          </div>
        );
      case "text/plain":
        return (
          <div className="h-15 w-fit text-indigo-500 dark:text-indigo-700 flex-center text-2xl">
            <AiOutlineFileText />
          </div>
        );

      case "application/json":
        return (
          <div className="h-15 w-fit text-indigo-500 dark:text-indigo-700 flex-center text-2xl">
            <BsFiletypeJson />
          </div>
        );
      default:
        return (
          <div className="h-15 w-fit text-slate-500 dark:text-slate-700 flex-center text-2xl">
            <AiOutlineFileUnknown />
          </div>
        );
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fileIcon = useMemo(() => getFileIcon(), [file.type]);
  const { name, extension } = parseFileName(file.name);
  return (
    <div className="flex flex-col gap-1 w-20 items-center">
      {fileIcon}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span dir="auto" className="line-clamp-1 max-w-full text-xs cursor-pointer">
              {truncateString(name, 5) + extension}
            </span>
          </TooltipTrigger>
          <TooltipContent className="text-xs leading-none mx-4 min-w-fit">
            <div className="flex items-start max-w-full flex-col gap-1">
              <span>{humanizeFileSize(file.size)}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

type onDrop<T extends File> = (
  acceptedFiles: T[],
  fileRejections: FileRejection[],
  event: DropEvent
) => void;

export type DropZoneProps = Omit<
  DropzoneOptions & Omit<ComponentPropsWithoutRef<"input">, "accept" | "value">,
  "onDrop" | "onChange"
> & {
  onDrop?: (files: File[]) => void;
  onChange?: (files: File[]) => void;
  value?: File[];
};

export function DropZone({
  onDrop,
  onChange,
  multiple = true,
  ...opts
}: DropZoneProps) {
  const [files, setFiles] = useState<File[]>(opts.value || []);
  const isThereFiles = files.length > 0;
  const onDropInner: onDrop<File> = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length < 1) {
        return;
      }
      if (opts.maxFiles && files.length >= opts.maxFiles) {
        return;
      }
      setFiles((prev) => [...prev, ...acceptedFiles]);
      onDrop?.(acceptedFiles);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files, onDrop]
  );
  useEffect(() => {
    onChange?.(files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop: onDropInner,
    multiple,
    ...opts,
  });
  return (
    <div className="relative">
      <div className="absolute top-3 left-3">
        {isThereFiles && (
          <Button
            className="text-xl"
            variant={{
              intent: "base",
            }}
            onClick={() => setFiles([])}
          >
            <BiRefresh />
          </Button>
        )}
      </div>
      <div
        data-active={!!isDragActive}
        {...getRootProps()}
        className="group/root w-full min-h-[150px] h-fit border-2 rounded-lg border-dashed border-gray-100 transition-all active:border-gray-500 hover:border-gray-300 flex items-center justify-center cursor-pointer bg-slate-50 dark:bg-slate-900"
      >
        <input {...getInputProps()} />
        <div>
          {isDragAccept && <p>All files will be accepted</p>}
          {isDragReject && <p>Some files will be rejected</p>}
          {!isDragActive && (
            <div className="w-full flex flex-col items-center justify-center p-5">
              <span className="text-3xl">⬆️</span>
              <span className="mb-4 font-semibold transition-all text-slate-400 group-active/root:text-slate-500 ">
                Click to upload or drag & drop
              </span>
              <span className="text-base text-center transition-all text-indigo-300 group-active/root:text-indigo-500 group-hover/root:text-indigo-400 font-normal">
                You can upload one file only, please make sure to read the
                instructions
              </span>
            </div>
          )}
        </div>
      </div>
      {files.length > 0 && (
        <div className="preview mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            {files.map((file, index) => (
              <FilePreviewRenderer key={index} file={file} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
