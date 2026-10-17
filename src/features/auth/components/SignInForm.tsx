"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EAppRoutes } from "@/constants/routes";
import type { TSignInValues } from "@/features/auth/schemas/sign-in.schema";
import { authClient } from "@/lib/auth/auth-client";
import type { TDictionary } from "@/lib/i18n/en";
import { createSignInSchema } from "@/lib/i18n/schemas";
import { getSafeNextPath } from "@/utils/get-safe-next-path";

type TSignInFormProps = {
  copy: TDictionary;
  nextPath?: string | null;
};

export function SignInForm({ copy, nextPath }: TSignInFormProps) {
  const router = useRouter();
  const schema = useMemo(() => createSignInSchema(copy.validation), [copy.validation]);
  const form = useForm<TSignInValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: TSignInValues) {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      form.setError("root", {
        message: error.status === 429 ? copy.signIn.rateLimited : copy.signIn.invalidCredentials,
      });
      return;
    }

    router.push(getSafeNextPath(nextPath, EAppRoutes.dashboard));
    router.refresh();
  }

  const rootError = form.formState.errors.root?.message;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="text-start">
      <FieldGroup className="gap-4">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-in-email" className="text-xs font-medium">
                {copy.signIn.email}
              </FieldLabel>
              <Input
                {...field}
                id="sign-in-email"
                type="email"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-in-password" className="text-xs font-medium">
                {copy.signIn.password}
              </FieldLabel>
              <Input
                {...field}
                id="sign-in-password"
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        {rootError ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
          >
            {rootError}
          </div>
        ) : null}
        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full rounded-full font-medium"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? copy.signIn.submitting : copy.signIn.submit}
        </Button>
      </FieldGroup>
    </form>
  );
}
