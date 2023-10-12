import { NavLink } from "@/components/ui/NavLink";
import { LucideIcon, MessageCircle, Settings2 } from "lucide-react";
import React from "react";

type Props = {
  children: React.ReactNode;
  params: {
    copilot_id: string;
  };
};

function SettingsNavLink({
  href,
  Icon,
  label,
}: {
  href: string;
  Icon: LucideIcon;
  label: React.ReactNode;
}) {
  return (
    <li className="w-full cursor-pointer select-none ">
      <NavLink
        href={href}
        className="flex items-center rounded-md border px-3 py-2 text-sm text-accent-foreground transition duration-150 ease-in-out"
        activeClassName="border-gray-300 bg-accent font-semibold"
        inactiveClassName="border-transparent hover:border-gray-300 font-normal opacity-80 hover:bg-accent"
      >
        <Icon className="mr-2 h-5 w-5" />
        {label}
      </NavLink>
    </li>
  );
}

export default function SettingsLayout({ children, params }: Props) {
  const copilotBase = `/copilot/${params.copilot_id}/settings`;
  return (
    <div className="flex h-full flex-row overflow-hidden">
      <div className="h-full w-aside shrink-0 border-r bg-primary-foreground">
        <div className="flex-center h-header justify-start border-b px-6">
          <h1 className="text-lg font-bold text-secondary-foreground">
            Settings
          </h1>
        </div>
        <div className="p-4">
          <ul className="space-y-1">
            <SettingsNavLink
              href={copilotBase + "/general"}
              Icon={Settings2}
              label="General"
            />
            <SettingsNavLink
              href={copilotBase + "/widget"}
              Icon={MessageCircle}
              label="Widget"
            />
          </ul>
        </div>
      </div>
      <div className="h-full flex-1 overflow-auto">{children}</div>
    </div>
  );
}
