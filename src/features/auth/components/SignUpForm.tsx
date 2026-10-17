"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EAppRoutes } from "@/constants/routes";
import type { TSignUpValues } from "@/features/auth/schemas/sign-up.schema";
import { authClient } from "@/lib/auth/auth-client";
import type { TDictionary } from "@/lib/i18n/en";
import { createSignUpSchema } from "@/lib/i18n/schemas";

type TSignUpFormProps = {
  copy: TDictionary;
};

export function SignUpForm({ copy }: TSignUpFormProps) {
  const router = useRouter();
  const schema = useMemo(() => createSignUpSchema(copy.validation), [copy.validation]);
  const form = useForm<TSignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: TSignUpValues) {
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      form.setError("root", {
        message: error.status === 429 ? copy.signUp.rateLimited : copy.signUp.failed,
      });
      return;
    }

    router.push(EAppRoutes.dashboard);
    router.refresh();
  }

  const rootError = form.formState.errors.root?.message;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="text-start">
      <FieldGroup className="gap-4">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-up-name" className="text-xs font-medium">
                {copy.signUp.name}
              </FieldLabel>
              <Input
                {...field}
                id="sign-up-name"
                autoComplete="name"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-up-email" className="text-xs font-medium">
                {copy.signUp.email}
              </FieldLabel>
              <Input
                {...field}
                id="sign-up-email"
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
              <FieldLabel htmlFor="sign-up-password" className="text-xs font-medium">
                {copy.signUp.password}
              </FieldLabel>
              <Input
                {...field}
                id="sign-up-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-up-confirm-password" className="text-xs font-medium">
                {copy.signUp.confirmPassword}
              </FieldLabel>
              <Input
                {...field}
                id="sign-up-confirm-password"
                type="password"
                autoComplete="new-password"
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
          {form.formState.isSubmitting ? copy.signUp.submitting : copy.signUp.submit}
        </Button>
      </FieldGroup>
    </form>
  );
}
