"use client";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AUTHCOOKIE } from "utils/CONSTS";
/**
 * @description detects if the window is in focus or not and detects if the user still has the cookie in place.
 */
export function OnGainFocus() {
  const { refresh } = useRouter();
  useEffect(() => {
    function onGainFocusHandler(ev: FocusEvent) {
      // dentect if the user still has the cookie in place.
      // if not, then redirect to the login page.
      // if so, then do nothing.

      const cookie = getCookie(AUTHCOOKIE);
      if (!cookie) {
        refresh();
      }
    }
    window.addEventListener("blur", onGainFocusHandler);
    window.addEventListener("focus", onGainFocusHandler);
    return () => {
      window.removeEventListener("focus", onGainFocusHandler);
      window.removeEventListener("blur", onGainFocusHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
