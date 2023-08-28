"use client";
import { Button } from "@/ui/components/Button";
import { useRouter } from "next/navigation";
import React from "react";
import { BsExclamationTriangle } from "react-icons/bs";
export default function ErrorComponent({ reset }: { reset: () => void }) {
  const { back } = useRouter();
  return (
    <div className="w-full grid place-content-center h-full container">
      <div className="p-5 flex items-center justify-center flex-col gap-2">
        <div>
          <BsExclamationTriangle size={50} className="text-rose-500" />
        </div>
        <div>Error Occured</div>
        <div className="space-x-2">
          <Button
            variant={{
              intent: "danger",
              size: "xs",
            }}
            onClick={reset}
          >
            reset
          </Button>
          <Button
            variant={{
              intent: "secondary",
              size: "xs",
            }}
            onClick={back}
          >
            back
          </Button>
        </div>
      </div>
    </div>
  );
}
