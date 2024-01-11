import { omit, pick } from "lodash";
import React, { forwardRef } from "react";
const stackProps = [
    "direction",
    "gap",
    "fluid",
    "ic",
    "js"
]
type StackProps = {
    direction?: "row" | "column" | "row-reverse" | "column-reverse";
    gap?: number;
    ic?: "start" | "end" | "center" | "stretch";
    js?: "start" | "end" | "center" | "between" | "around";
    fluid?: boolean;
}
type Props = StackProps & React.HTMLAttributes<HTMLDivElement>;

function getStackStyles(opts: StackProps, styles: React.CSSProperties = {}) {
    const {
        direction = "row",
        gap = 0,
        ic = "start",
        js,
        fluid = true
    } = opts;

    return {
        '--stack-gap': gap === 0 ? 'unset' : `${gap}px`,
        gap: "var(--stack-gap)",
        display: "flex",
        flexDirection: direction,
        justifyContent: js,
        alignItems: ic,
        width: fluid ? "100%" : undefined,
        ...styles
    } as React.CSSProperties
}
const Stack = forwardRef<HTMLDivElement, Props>(
    ({ style, ...props }, ref) => {
        return <div
            {...omit(props, stackProps)}
            ref={ref}
            style={getStackStyles(pick(props, stackProps), style)}
        />
    }
);
Stack.displayName = "Stack";

export {
    Stack
}