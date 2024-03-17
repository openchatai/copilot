import { useConfigData } from "@lib/contexts";
import { UserIcon } from "lucide-react";

export function UserAvatar() {
  const config = useConfigData();

  if (config?.user?.avatarUrl) {
    return (
      <img
        className="h-7 w-7 rounded-lg shrink-0 object-cover aspect-square"
        src={config.user.avatarUrl}
      />
    );
  }

  return (
    <div className="rounded-lg shrink-0 bg-accent h-7 w-7 object-cover aspect-square border border-primary flex items-center justify-center">
      <span className="text-xl text-primary fill-current">
        <UserIcon className="size-[1em]" />
      </span>
    </div>
  );
}
