import * as React from "react";

import { cn } from "@/lib/utils";
import TextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";
export interface TextareaProps extends TextareaAutosizeProps { }

const Textarea = React.forwardRef<React.ElementRef<"textarea">, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextareaAutosize
        className={cn(
          "flex w-full resize-none border-border rounded-md data-[valid=false]:!border-destructive border bg-background p-3 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
        ref={ref}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
