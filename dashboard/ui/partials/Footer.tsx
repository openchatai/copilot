import Logo from "./Logo";

export function Footer() {
  return (
    <footer className="w-full border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 border-t">
      <div className="px-4 sm:px-6 lg:px-8 py-3 max-w-[96rem]">
        <div className="flex w-full justify-between items-end">
          <div className="flex flex-col items-start gap-1">
            <Logo withname />
            <div>
              <p className="text-xs">
                Copyright © 2023 Openchat Inc. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
