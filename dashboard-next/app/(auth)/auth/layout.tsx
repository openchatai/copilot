import { CardWrapper } from "@/ui/components/wrappers/CardWrapper";
import Logo from "@/ui/partials/Logo";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { Link } from "@/ui/router-events";
import { redirect } from "next/navigation";
import React from "react";
import { AUTHCOOKIE } from "utils/CONSTS";

const ThemeSwitch = dynamic(() => import("@/ui/components/ThemeSwitch"), {
  ssr: false,
});

export const metadata = {
  title: "login or register | OpenCopilot",
  description: "login or register to OpenCopilot",
};

function Layout({ children }: { children: React.ReactNode }) {
  const authCookie = cookies().get(AUTHCOOKIE);

  if (authCookie?.value) {
    return redirect("/app");
  }
  return (
    <div className="bg-white dark:bg-slate-800 flex w-full flex-col min-h-screen">
      <div className="w-full">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Logo />
          </Link>

          <ThemeSwitch />
        </div>
      </div>
      <div className="container flex-1 flex-center">
        <CardWrapper className="max-w-md w-full h-fit relative z-20 overflow-hidden">
          {children}
        </CardWrapper>
      </div>
    </div>
  );
}

export default Layout;
