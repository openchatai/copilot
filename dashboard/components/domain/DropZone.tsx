"use client";
import { humanizeFileSize, parseFileName, truncateString } from "@/lib/misc";
import {
  FileIcon,
  FileImage,
  FileJson,
  FileText,
  RefreshCw,
} from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";

function FilePreviewRenderer({ file }: { file: File }) {
  function getFileIcon() {
    switch (file.type) {
      case "application/pdf":
        return (
          <div className="h-15 flex-center w-fit text-2xl text-red-500 dark:text-red-700">
            <FileImage />
          </div>
        );
      case "text/plain":
        return (
          <div className="h-15 flex-center w-fit text-2xl text-indigo-500 dark:text-indigo-700">
            <FileText />
          </div>
        );

      case "application/json":
        return (
          <div className="h-15 flex-center w-fit text-2xl text-indigo-500 dark:text-indigo-700">
            <FileJson />
          </div>
        );
      default:
        return (
          <div className="h-15 flex-center w-fit text-2xl text-slate-500 dark:text-slate-700">
            <FileIcon />
          </div>
        );
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fileIcon = useMemo(() => getFileIcon(), [file.type]);
  const { name, extension } = parseFileName(file.name);
  return (
    <div className="flex w-20 flex-col items-center gap-1">
      {fileIcon}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              dir="auto"
              className="line-clamp-1 max-w-full cursor-pointer text-xs"
            >
              {truncateString(name, 5) + "." + extension}
            </span>
          </TooltipTrigger>
          <TooltipContent className="mx-4 min-w-fit text-xs leading-none">
            <div className="flex max-w-full flex-col items-start gap-1">
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
  event: DropEvent,
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
    [files, onDrop],
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
      <div className="absolute left-3 top-3">
        {isThereFiles && (
          <Button
            className="text-xl"
            variant="ghost"
            size="icon"
            onClick={() => setFiles([])}
          >
            <RefreshCw />
          </Button>
        )}
      </div>
      <div
        data-active={!!isDragActive}
        {...getRootProps()}
        className="group/root flex h-fit min-h-[150px] w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border p-8"
      >
        <input {...getInputProps()} />
        <div>
          {isDragAccept && <p>All files will be accepted</p>}
          {isDragReject && <p>Some files will be rejected</p>}
          {!isDragActive && (
            <div className="flex w-full flex-col items-center justify-center">
              <span className="text-3xl">⬆️</span>
              <span className="mb-4 font-semibold text-slate-700">
                Click to upload or drag & drop
              </span>
              <span className="text-center text-base font-normal text-indigo-600 transition-all">
                You can upload one file only, please make sure to read the
                instructions
              </span>
            </div>
          )}
        </div>
      </div>
      {files.length > 0 && (
        <div className="preview mt-4">
          <div className="flex flex-wrap items-center gap-2">
            {files.map((file, index) => (
              <FilePreviewRenderer key={index} file={file} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
