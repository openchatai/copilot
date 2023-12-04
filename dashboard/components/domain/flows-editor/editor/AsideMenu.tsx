import { PathButton } from "./PathButton";
import { useMemo, useState } from "react";
import { useController } from "../stores/Controller";
import { isEmpty } from "lodash";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useCopilot } from "@/app/(copilot)/copilot/_context/CopilotProvider";
import { getSwaggerByBotId } from "@/data/swagger";
import useSWR from "swr";
import { transformPaths } from "..";
import { EmptyBlock } from "../../EmptyBlock";
import Loader from "@/components/ui/Loader";

export function AsideMenu() {
  const {
    state: { paths },
    loadPaths
  } = useController();
  const { id: copilotId } = useCopilot();
  const [search, setSearch] = useState("");
  const { isLoading } = useSWR(
    copilotId + "swagger_file",
    async () => getSwaggerByBotId(copilotId),
    {
      onSuccess: (data) => {
        if (!data) return;
        loadPaths(transformPaths(data.data.paths));
      },
    },
  );
  const renderedPaths = useMemo(
    () =>
      search.trim().length > 0
        ? paths.filter((path) => path.path.includes(search.trim()))
        : paths,
    [search, paths],
  );

  return (
    <aside
      className={cn(
        "absolute z-20 h-full max-h-full w-full max-w-sm origin-right overflow-hidden border-r border-border bg-card shadow-lg ease-in-out",
      )}
    >
      <div className="h-full w-full py-2">
        <div className="flex h-full max-h-full w-full flex-col items-start gap-2 overflow-hidden [&>*]:w-full"
        >
          <div className="flex flex-col gap-2 items-start px-4 backdrop-blur-sm bg-card/20 border-b py-4">
            <h1 className="text-base font-semibold text-accent-foreground">
              Select a Step
            </h1>
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>
          <div className="flex-1 overflow-auto px-4">
            <ul className="h-fit select-none space-y-1">
              {isLoading ? <div className="flex-center w-full"><Loader /></div> : isEmpty(renderedPaths) ? <EmptyBlock /> : (
                <>
                  {renderedPaths.map((path) => (
                    <li key={path.path}>
                      <PathButton path={path} />
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}