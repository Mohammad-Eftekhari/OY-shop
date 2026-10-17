"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EApiRoutes } from "@/constants/routes";
import { profileQueryKeys } from "@/features/profile/queries/profile-keys";
import {
  profileResponseSchema,
  type TProfile,
  type TProfileValues,
} from "@/features/profile/schemas/profile.schema";
import { ApiClientError } from "@/lib/api/client";
import type { TDictionary } from "@/lib/i18n/en";
import { createProfileFormSchema } from "@/lib/i18n/schemas";
import { useSender } from "@/lib/query";

type TProfileFormProps = {
  copy: TDictionary;
  initialProfile: TProfile;
};

export function ProfileForm({ copy, initialProfile }: TProfileFormProps) {
  const schema = useMemo(() => createProfileFormSchema(copy.validation), [copy.validation]);
  const form = useForm<TProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: initialProfile.displayName,
      bio: initialProfile.bio,
    },
  });

  const mutation = useSender<TProfile, TProfileValues>({
    url: EApiRoutes.profile,
    method: "PUT",
    schema: profileResponseSchema,
    invalidateKeys: [profileQueryKeys.current],
  });

  const rootError = form.formState.errors.root?.message;
  const isSaving = form.formState.isSubmitting || mutation.isPending;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs sm:p-8">
      <form
        onSubmit={form.handleSubmit((values) =>
          mutation.mutate(values, {
            onSuccess: (profile) => {
              form.reset({ displayName: profile.displayName, bio: profile.bio });
              toast.success(copy.profile.saved);
            },
            onError: (error) => {
              const message =
                error instanceof ApiClientError ? error.message : copy.profile.saveError;
              form.setError("root", { message });
            },
          }),
        )}
        noValidate
        className="text-start"
      >
        <FieldGroup className="gap-5">
          <Controller
            name="displayName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-display-name" className="text-xs font-medium">
                  {copy.profile.displayName}
                </FieldLabel>
                <Input
                  {...field}
                  id="profile-display-name"
                  autoComplete="nickname"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="bio"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-bio" className="text-xs font-medium">
                  {copy.profile.biography}
                </FieldLabel>
                <Textarea {...field} id="profile-bio" aria-invalid={fieldState.invalid} />
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
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="rounded-full font-medium"
              disabled={isSaving}
            >
              {isSaving ? copy.profile.saving : copy.profile.save}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
