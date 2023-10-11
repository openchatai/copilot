import { Button } from "@/components/ui/button";
import React from "react";

type Props = {};

function page({}: Props) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-6">
        <div className="bg-primary aspect-square" />
        <div className="bg-primary-foreground aspect-square" />
        <div className="bg-secondary aspect-square" />
        <div className="bg-secondary-foreground aspect-square" />
        <div className="bg-destructive aspect-square" />
        <div className="bg-accent aspect-square" />
        <div className="bg-accent-foreground aspect-square" />
        <div className="bg-accent-alt aspect-square" />
      </div>
      <div className="space-x-4 mt-4 bg-white">
        <Button variant="default">Primary (Default)</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Danger</Button>
        <Button variant="outline">Outlined</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
    </div>
  );
}

export default page;
