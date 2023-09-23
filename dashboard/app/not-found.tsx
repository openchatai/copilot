"use client";
import { Button } from "@/ui/components/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const { back } = useRouter();
  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="max-w-2xl m-auto mt-16">
          <div className="text-center px-4">
            <div className="inline-flex mb-8">
              <div className="relative aspect-square w-44 animate-in fade-in slide-in-from-bottom-1">
                <Image
                  placeholder="empty"
                  className="hidden dark:block"
                  src={"/illustrations/404-illustration.svg"}
                  fill
                  alt="404 illustration dark"
                />
                <Image
                  placeholder="empty"
                  className="block dark:hidden"
                  src={"/illustrations/404-illustration-dark.svg"}
                  fill
                  alt="404 illustration dark"
                />
              </div>
            </div>
            <div className="mb-6 text-slate-600 dark:text-slate-400 delay-100 animate-in fade-in slide-in-from-bottom-1">
              Hmm...this page doesn't exist.
            </div>
            <div className="max-w-tiny mx-auto delay-150 animate-in fade-in slide-in-from-bottom-1">
              <Button
                onClick={back}
                variant={{ width: "fluid", intent: "primary" }}
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
