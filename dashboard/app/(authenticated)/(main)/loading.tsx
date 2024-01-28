import Loader from "@/components/ui/Loader";
import React from "react";

export default function Loading() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Loader />
    </div>
  );
}
