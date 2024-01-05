import { useCopyToClipboard } from "@/hooks/copy-to-clipboard";
import * as React from "react";
import { ComponentProps } from "react";

export interface ButtonProps extends ComponentProps<"button"> {
  text?: string;
}

const CopyButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ onClick, text = "", ...props }, ref) => {
    const [copied, copy] = useCopyToClipboard();
    return (
      <button
        ref={ref}
        {...props}
        data-copied={copied}
        disabled={copied}
        onClick={(ev) => {
          copy(text);
          onClick?.(ev);
        }}
      />
    );
  },
);
CopyButton.displayName = "Button";

export { CopyButton };
