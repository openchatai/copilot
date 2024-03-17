import { UserAvatar } from "@lib/components";
import { formatTimeFromTimestamp } from "@lib/utils/time";

export function UserMessage({
  content,
  timestamp,
}: {
  content: string;
  timestamp?: number | Date;
  id?: string | number;
}) {
  return (
    <div
      dir="auto"
      className="w-full overflow-x-auto shrink-0 max-w-full last-of-type:mb-10 bg-accent p-2 flex gap-3 items-center"
    >
      <UserAvatar />
      <div>
        <p className="prose prose-slate font-medium text-sm prose-sm">
          {content}
        </p>
        <span>{timestamp && formatTimeFromTimestamp(timestamp)}</span>
      </div>
    </div>
  );
}
