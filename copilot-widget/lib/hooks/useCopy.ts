import { useState, useEffect } from "react";

type CopyFn = (text: any) => Promise<boolean>;

export function useCopyToClipboard(): [boolean, CopyFn] {
  const [copied, setCopied] = useState(false);
  const copy: CopyFn = async (text) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    // Try to save to clipboard then update the state if it worked
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopied(false);
      return false;
    }
  };

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return [copied, copy];
}
