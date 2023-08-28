"use client";
import { createSafeContext } from "@/ui/utils/createSafeContext";

import React from "react";
import { UserType } from "schemas";
import useSWR from "swr";
import axiosInstance from "utils/axiosInstance";

const [UserSafeProvider, useUserService] = createSafeContext<{
  user: UserType | undefined;
  loading: boolean;
}>("");

export default function UserService({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading, isValidating } = useSWR("/me", () =>
    axiosInstance.get<UserType>("/me")
  );
  return (
    <UserSafeProvider
      value={{
        user: data?.data,
        loading: isLoading || isValidating,
      }}
    >
      {children}
    </UserSafeProvider>
  );
}


export { useUserService };
