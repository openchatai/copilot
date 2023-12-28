// used inside ui/components/DropZone file renderer
export function humanizeFileSize(sizeInBytes: number) {
  if (sizeInBytes < 1024) {
    return sizeInBytes + " B";
  } else if (sizeInBytes < 1024 * 1024) {
    return (sizeInBytes / 1024).toFixed(2) + " KB";
  } else {
    return (sizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
  }
}
// used inside ui/components/DropZone file renderer
export function parseFileName(input: string) {
  const lastDotIndex = input.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    const name = input.substring(0, lastDotIndex);
    const extension = input.substring(lastDotIndex + 1);
    return { name, extension };
  } else {
    // If no extension found, consider the whole string as the name
    return { name: input, extension: "" };
  }
}

export function truncateString(input: string, maxLength: number) {
  if (input.length <= maxLength) {
    return input;
  } else {
    return input.substring(0, maxLength) + "...";
  }
}
// used inside ui/components/DropZone file renderer
export function megabytesToBytes(megabytes: number) {
  const bytesInMegabyte = 1024 * 1024;
  return megabytes * bytesInMegabyte;
}

export const or = (...args: boolean[]) => args.some(Boolean);
export const and = (...args: boolean[]) => args.every(Boolean);
export const not = (arg: boolean) => !arg;

export function getFileData(file: File) {
  return {
    name: file.name,
    size: humanizeFileSize(file.size),
    type: file.type,
  }
}