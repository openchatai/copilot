import React, { ComponentPropsWithoutRef, ReactNode } from "react";
import { Heading } from "../components/Heading";

type Props = {
  heading?: string;
  headingElement?: ReactNode;
  children: ReactNode;
  badge?: ReactNode;
} & ComponentPropsWithoutRef<"div">;

export default function DescriptiveHeading({
  heading,
  badge,
  headingElement,
  children,
  ...props
}: Props) {
  return (
    <div {...props}>
      <div className="flex items-center justify-start gap-2">
        {heading && !headingElement && (
          <Heading level={5} className="mb-1 font-bold">
            {heading}
          </Heading>
        )}
        {headingElement && !heading && headingElement}
        {badge}
      </div>
      <p className="text-sm">{children}</p>
    </div>
  );
}
