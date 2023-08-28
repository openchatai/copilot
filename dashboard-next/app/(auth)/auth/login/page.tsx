"use client";
import { Button } from "@/ui/components/Button";
import { Heading } from "@/ui/components/Heading";
import { FormField } from "@/ui/components/inputs/FormInput";
import { Formiz, useForm } from "@formiz/core";
import { Link } from "@/ui/router-events";
import {
  isEmail,
  isRequired,
  isNotEmptyString,
  isMinLength,
} from "@formiz/validations";
export default function LoginRoute() {
  const form = useForm();
  async function handleLogin(values: { email: string; password: string }) {}
  return (
    <>
      <Heading level={4} className="mb-6 font-semibold">
        Welcome back
      </Heading>
      <Formiz onValidSubmit={handleLogin} connect={form}>
        <div className="space-y-4">
          <FormField
            validations={[
              {
                rule: isNotEmptyString(),
                message: "Email is required",
              },
              {
                rule: isEmail(),
                message: "Email is not valid",
              },
              {
                rule: isRequired(),
                message: "Email is required",
              },
            ]}
            label="Email Address"
            type="email"
            name="email"
            autoComplete="on"
          />
          <FormField
            validations={[
              {
                rule: isNotEmptyString(),
                message: "Password is required",
              },
              {
                rule: isRequired(),
                message: "Password is required",
              },
              {
                rule: isMinLength(8),
                message: "the password should be 8 characters minmmum",
              },
            ]}
            label="Password"
            type="password"
            name="password"
            autoComplete="on"
          />
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="mr-1">
            <Link
              className="text-sm underline hover:no-underline"
              href="/auth/reset-password"
            >
              Forgot Password?
            </Link>
          </div>
          <Button
            disabled={!form.isValid || form.isValidating}
            onClick={() => form.submit()}
            loading={form.isValidating}
            variant={{ intent: "primary" }}
          >
            Sign In
          </Button>
        </div>
      </Formiz>
      <div className="pt-5 mt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="text-sm">
          Do not you have an account?{" "}
          <Link
            className="font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
            href="/auth/register"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </>
  );
}
