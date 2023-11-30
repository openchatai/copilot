import { PathButton } from "./PathButton";
import { useMemo, useState } from "react";
import { FlowsList } from "./FlowsList";
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
        "absolute z-20 h-full max-h-full w-full max-w-sm origin-right overflow-hidden border-r border-border bg-white shadow-lg ease-in-out",
      )}
    >
      <div className="h-full w-full py-2">
        <div
          data-container="select-node"
          className="flex h-full max-h-full w-full flex-col items-start gap-5 overflow-hidden animate-in data-[hidden=true]:hidden data-[hidden=true]:animate-out data-[hidden=true]:slide-out-to-left-full [&>*]:w-full"
        >
          <div className="flex items-center px-4 pt-4">
            <h1 className="flex-1 text-base font-semibold text-accent-foreground">
              Select a Step
            </h1>
          </div>
          <div className="w-full px-4">
            <div className="flex items-center">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto px-4 pb-8">
            <ul className="h-fit select-none space-y-1">
              {
                isLoading && <div className="flex-center w-full"><Loader /></div>
              }
              {isEmpty(renderedPaths) ? <EmptyBlock /> : (
                <>
                  {renderedPaths.map((path) => (
                    <li key={path.path} className="w-full">
                      <PathButton path={path} />
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
      <FlowsList />
    </aside>
  );
}