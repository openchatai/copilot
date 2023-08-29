import cn from "../utils/cn";

function Skeleton({
  className,
  circle,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  circle?: boolean;
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-400 animate-in",
        circle && "rounded-full",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
