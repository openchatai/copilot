import React, { ReactNode } from "react";
import { Header } from "@/ui/partials/DashboardHeader";
import { cookies, headers } from "next/headers";
import { AUTHCOOKIE, AUTH_ROUTE } from "utils/CONSTS";
import { redirect } from "next/navigation";
import { OnGainFocus } from "@/ui/partials/CatchOnGainFocus";
import UserService from "services/userService";
import { Footer } from "@/ui/partials/Footer";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authCookie = cookies().get(AUTHCOOKIE)?.value;

  if (!authCookie) {
    const headersList = headers();
    const header_url = headersList.get("x-url") || "";
    const params = new URLSearchParams({
      action: "redirect_after",
      target: header_url,
    });
    return redirect(AUTH_ROUTE + "?" + params.toString());
  }
  return (
    <>
      <OnGainFocus />
      <UserService>
        <div className="flex h-[100dvh] overflow-hidden">
          <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Header />
            <main className="w-full grow">{children}</main>
            <Footer />
          </div>
        </div>
      </UserService>
    </>
  );
}
