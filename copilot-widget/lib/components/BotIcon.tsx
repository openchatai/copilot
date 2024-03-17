import { useConfigData } from "@lib/contexts";
import cn from "@lib/utils/cn";

export function BotIcon({ error }: { error?: boolean }) {
  const config = useConfigData();

  return (
    <img
      className={cn(
        "h-7 w-7 rounded-lg shrink-0 object-cover aspect-square",
        error && "border border-rose-500 shadow-none"
      )}
      src={
        config?.bot?.avatarUrl ||
        "https://cdn.dribbble.com/users/281679/screenshots/14897126/media/f52c47307ac2daa0c727b1840c41d5ab.png?compress=1&resize=1600x1200&vertical=center"
      }
      alt={`${config?.bot?.name ?? "Bot"}'s avatar`}
    />
  );
}
