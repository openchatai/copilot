"use client";
import { forwardRef, useState } from "react";
import { ButtonProps, Button } from "./Button";
import cn from "../utils/cn";
/**
 * Button that requires double click to trigger onClick event.
 */
export const DoubleCheckButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, _ref) => {
    const [clicked, setClicked] = useState(false);
    function handleDoubleClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (clicked) {
        props.onClick?.(e);
      } else {
        setClicked(true);
      }
    }
    return (
      <Button
        ref={_ref}
        {...props}
        data-clicked={clicked}
        className={cn("opacity-50 data-[clicked=true]:opacity-100", className)}
        onClick={handleDoubleClick}
      />
    );
  }
);

DoubleCheckButton.displayName = "DoubleCheckButton";
