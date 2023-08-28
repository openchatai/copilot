"use client";
import { Link } from "@/ui/router-events";
import { FormField } from "@/ui/components/inputs/FormInput";
import { Formiz, useForm } from "@formiz/core";
import { Button } from "@/ui/components/Button";
import CheckBoxInput from "@/ui/components/inputs/CheckBox";
import { Heading } from "@/ui/components/Heading";
import * as v from "valibot";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useStatus } from "@/ui/hooks";
import { Loading } from "@/ui/components/Loading";
import cn from "@/ui/utils/cn";
import { toast } from "@/ui/components/headless/toast/use-toast";
import { REGISTER_URL } from "utils/endpoints";

const schema = v.object({
  name: v.string(),
  email: v.string([v.email()]),
  password: v.string(),
});

const responseSchema = v.object({
  user: v.object({
    id: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    source: v.string(),
    ref: v.nullable(v.string()),
    email_verified_at: v.nullable(v.date()),
    created_at: v.string(),
    updated_at: v.string(),
    token: v.string(),
  }),
  access_token: v.string(),
});
export default function RegisterRoute({
  searchParams: { action, target },
}: {
  searchParams: {
    action?: string;
    target?: string;
  };
}) {
  const { push } = useRouter();
  const form = useForm();
  const [, setStatus, is] = useStatus();
  async function handleRegister(values: unknown) {
    setStatus("pending");
    try {
      const formData = v.parse(schema, values);
      if (formData) {
        const getAccessToken = await axios.post(REGISTER_URL, formData, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (getAccessToken.data.access_token) {
          // set the cookie on the server too only if the request is successful
          await axios.post("/api/auth/login", {
            auth_token: getAccessToken.data.access_token,
          });
          toast({
            title: "Success",
            description: "Now redirecting to dashboard",
            intent: "success",
          });
          // redirect after successful login
          setStatus("resolved");
          if (action === "redirect_after" && target) push(target);
          else {
            push("/app");
          }
        } else {
          toast({
            title: "Error signing you in",
            description: "Please try again",
            intent: "error",
          });
        }
      }
      setStatus("idle");
    } catch (error) {
      toast({
        title: "Error signing you in",
        description: "Please try again",
        intent: "error",
      });
      setStatus("rejected");
    }
  }

  return (
    <>
      <Heading level={4} className="mb-6 font-semibold">
        Create your Account
      </Heading>
      {/* Form */}
      <Formiz
        autoForm
        connect={form}
        onValidSubmit={handleRegister}
        initialValues={{
          name: "",
          email: "",
          password: "",
        }}
      >
        <div className="space-y-4">
          <FormField required label="Full Name" name="name" type="text" />
          <FormField required label="Email Address" name="email" type="email" />
          <FormField
            required
            label="Password"
            name="password"
            type="password"
          />
        </div>
        <div className="flex items-center justify-between mt-6">
          <CheckBoxInput
            label="Email me about product news."
            name="confirm"
            required
          />
          <Button
            variant={{ intent: "primary" }}
            disabled={!form.isValid || is("pending")}
            onClick={() => form.submit()}
          >
            <span className={cn(is("pending") && "opacity-0")}>Sign Up</span>
            {is("pending") && (
              <Loading
                size={25}
                wrapperClassName="p-0 inset-0 absolute mix-blend-difference"
              />
            )}
          </Button>
        </div>
      </Formiz>
      {/* Footer */}
      <div className="pt-5 mt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="text-sm">
          Have an account?{" "}
          <Link
            className="font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
            href="/auth/login"
          >
            Sign In
          </Link>
        </div>
      </div>
    </>
  );
}
