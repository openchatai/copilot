import { useEffect, MutableRefObject } from "react";

export const useMutationObserver = (
  ref: MutableRefObject<HTMLElement | null>,
  // eslint-disable-next-line no-unused-vars
  callback: (mutations: MutationRecord[], observer: MutationObserver) => void,
  options = {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  },
) => {
  useEffect(() => {
    if (ref.current) {
      const observer = new MutationObserver(callback);
      observer.observe(ref.current, options);
      return () => observer.disconnect();
    }
  }, [ref, callback, options]);
};
