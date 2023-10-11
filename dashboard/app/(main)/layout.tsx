import { Button } from "@/components/ui/button";
import Aside from "./parts/Aside";
import SelectWorkspace from "./parts/SelectWorkspace";


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full flex flex-col">
      <header className="h-header w-full border-b shrink-0 border-border flex flex-row">
        <div className="w-aside border-r border-border h-full bg-primary-foreground">
          <SelectWorkspace />
        </div>
        <div className="flex-1 flex items-center justify-between px-8">
          <div>
            <h1 className="text-lg font-bold text-accent-foreground">
              All Copilots
            </h1>
          </div>
          <div className="space-x-2">
            <Button variant="secondary">Invite</Button>
            <Button>Create Copilot</Button>
          </div>
        </div>
      </header>
      <main className="w-full flex-1 flex flex-row overflow-hidden">
        <Aside />
        {children}
      </main>
    </div>
  );
}
