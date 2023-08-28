"use client";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";
import { default as NextLink } from "next/link";
import { useEvents } from "./Context";
import { useParams, usePathname, useSearchParams } from "next/navigation";
type LinkProps = ComponentPropsWithoutRef<typeof NextLink> & {};
export const Link = forwardRef<ElementRef<typeof NextLink>, LinkProps>(
  ({ onClick, ...props }, _ref) => {
    const { href, target } = props;
    const { change } = useEvents();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentUrl = pathname + searchParams.toString();
    const isSameUrl = href?.toString() === currentUrl;
    function handleClicked(ev: React.MouseEvent<HTMLAnchorElement>) {
      // detect if page opened in new tab. if so => don't trigger change
      // detect if the href is external. if so => don't trigger change
      // detect if the href is the same as the current url. if so => don't trigger change
      const isExternal =
        target === "_blank" || href?.toString().startsWith("http");
      const isNewTab =
        target === "_blank" || ev.ctrlKey || ev.metaKey || ev.shiftKey;
      if (!isExternal && !isNewTab && !isSameUrl) {
        change("changeStarted");
      }

      onClick?.(ev);
    }
    return <NextLink {...props} onClick={handleClicked} ref={_ref} />;
  }
);

Link.displayName = "Link";
