import CreateBot from "@/ui/partials/CreateBot";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create New Bot",
  description: "Create a new bot for your service.",
};

export default function CreateNewBot() {
  return (
    <div>
      <div className="container md:p-6 p-3">
        <div className="px-4 pt-12 pb-8">
          <div className="max-w-md mx-auto relative">
            <CreateBot />
          </div>
        </div>
      </div>
    </div>
  );
}
