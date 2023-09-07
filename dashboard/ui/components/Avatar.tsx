"use client";
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import cn from "../utils/cn";
import { VariantProps, tv } from "tailwind-variants";

const AvatarVariants = tv({
  variants: {
    size: {
      1: "w-6 h-6 text-lg",
      2: "w-8 h-8 text-base",
      3: "w-10 h-10 text-sm",
      4: "w-12 h-12 text-xs",
      5: "w-14 h-14 text-tiny",
    },
  },
  defaultVariants: {
    size: 2,
  },
});

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
    VariantProps<typeof AvatarVariants>
>(({ className, size, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      AvatarVariants({ size }),
      "relative font-semibold overflow-hidden rounded-full select-none inline-block shrink-0",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn(
      "aspect-square h-full w-full max-w-full max-h-full inline-block shrink-0",
      className
    )}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full aspect-square max-w-full max-h-full shrink-0 leading-none items-center justify-center rounded-full text-sm bg-indigo-500 font-semibold text-white",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
