"use client";
import { Button } from "@/ui/components/Button";
import { Heading } from "@/ui/components/Heading";
import { Input } from "@/ui/components/inputs/BaseInput";
import { Link } from "@/ui/router-events";

export default function LoginRoute() {
  return (
    <>
      <Heading level={4} className="mb-6 font-semibold">
        Reset your Password ✨
      </Heading>
      <div className="space-y-4">
        <Input label="Email Address" type="email" />
      </div>
      <div className="flex items-center justify-between mt-6">
        <Button variant={{ intent: "secondary" }} asChild>
          <Link href="/auth/login">Back</Link>
        </Button>
        <Button variant={{ intent: "primary" }}>Send Reset Link</Button>
      </div>
      <div className="pt-5 mt-6 border-t border-slate-200 dark:border-slate-700"></div>
    </>
  );
}
