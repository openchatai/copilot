import Aside from "./parts/Aside";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full flex">
      <Aside />
      <main className="w-full flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
