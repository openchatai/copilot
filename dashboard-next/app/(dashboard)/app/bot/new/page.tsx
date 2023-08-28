import { CardWrapper } from "@/ui/components/wrappers/CardWrapper";
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
        <CardWrapper className="max-w-xl p-6 mx-auto">
          <CreateBot />
        </CardWrapper>
      </div>
    </div>
  );
}
