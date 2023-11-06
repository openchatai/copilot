import { useMode } from "../stores/ModeProvider";
import { PathButton } from "./PathButton";
import { useMemo, useState } from "react";
import { MethodBtn } from "./MethodRenderer";
import { FlowsList } from "./FlowsList";
import { useController } from "../stores/Controller";
import { isEmpty } from "lodash";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function AsideMenu() {
  const {
    state: { paths },
  } = useController();

  const { mode, isEdit } = useMode();

  const [search, setSearch] = useState("");

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
          data-hidden={isEdit}
          className="flex h-full max-h-full w-full flex-col items-start gap-5 overflow-hidden animate-in data-[hidden=true]:hidden data-[hidden=true]:animate-out data-[hidden=true]:slide-out-to-left-full [&>*]:w-full"
        >
          <div className="flex items-center px-4 pt-4">
            <h1 className="flex-1 text-base font-semibold text-accent-foreground">
              Select Step
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
              {!isEmpty(renderedPaths) && (
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
        <div
          className="flex h-full w-full flex-col items-start pt-4 animate-in data-[hidden=true]:hidden data-[hidden=true]:animate-out data-[hidden=true]:slide-out-to-right-full"
          data-container="edit-node"
          data-hidden={!isEdit}
        >
          {mode.type === "edit-node" && (
            <div className="space-y-2 px-4">
              <div className="w-full">
                <h1 className="space-x-1 text-xl font-semibold">
                  <code>{mode.node.data.path}</code>
                  <MethodBtn
                    method={mode.node.data.method}
                    className="pointer-events-none inline text-xs"
                  >
                    {mode.node.data.method}
                  </MethodBtn>
                </h1>
              </div>
              <div>
                {/* {mode.node.data.tags?.map((t, i) => (
                  <span className="text-sm" key={i}>
                    #{t}
                  </span>
                ))} */}
              </div>
              <div className="w-full flex-1 p-2">
                <p>{mode.node.data.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <FlowsList />
    </aside>
  );
}
