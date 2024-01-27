'use client';
import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";


export function Counter({
  value,
  direction = "up",
}: {
  value?: number;
  direction?: "up" | "down";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue);
  const isInView = useInView(ref, { once: true, margin: "0px" });
  const [renderedValue, setRenderedValue] = useState(0);
  useEffect(() => {
    if (isInView) {
      motionValue.set(direction === "down" ? 0 : value ?? 0);

      if (value === 0) {
        motionValue.set(0);
      }
    }
  }, [motionValue, isInView, value, direction]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        setRenderedValue(Math.round(latest));
      }),
    [springValue]
  );

  return <span ref={ref}>{renderedValue}</span>;
}