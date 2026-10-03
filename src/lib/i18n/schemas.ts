import { z } from "zod";

import type { TDictionary } from "@/lib/i18n/en";

type TValidationCopy = TDictionary["validation"];

export function createEmailSchema(copy: TValidationCopy) {
  return z.email(copy.email);
}

export function createPasswordSchema(copy: TValidationCopy) {
  return z.string().min(8, copy.passwordMin).max(128, copy.passwordMax);
}

export function createSignInSchema(copy: TValidationCopy) {
  return z.object({
    email: createEmailSchema(copy),
    password: createPasswordSchema(copy),
  });
}

export function createSignUpSchema(copy: TValidationCopy) {
  return z
    .object({
      name: z.string().trim().min(1, copy.nameRequired).max(80, copy.nameMax),
      email: createEmailSchema(copy),
      password: createPasswordSchema(copy),
      confirmPassword: z.string().min(1, copy.confirmPassword),
    })
    .refine((values) => values.password === values.confirmPassword, {
      path: ["confirmPassword"],
      message: copy.passwordMismatch,
    });
}

export function createAddressFormSchema(copy: TValidationCopy) {
  return z.object({
    receiverName: z.string().trim().min(1, copy.required),
    mobile: z.string().regex(/^09\d{9}$/, copy.mobile),
    province: z.string().trim().min(1, copy.required),
    city: z.string().trim().min(1, copy.required),
    postalCode: z.string().regex(/^\d{10}$/, copy.postalCode),
    addressLine: z.string().trim().min(1, copy.required),
    isDefault: z.boolean(),
  });
}

export function createProfileFormSchema(copy: TValidationCopy) {
  return z.object({
    displayName: z.string().trim().min(1, copy.displayNameRequired).max(80, copy.displayNameMax),
    bio: z.string().trim().max(280, copy.bioMax),
  });
}

export function createProfileRequestSchema(copy: TValidationCopy) {
  const formSchema = createProfileFormSchema(copy);

  return z.object({
    displayName: formSchema.shape.displayName,
    bio: formSchema.shape.bio.optional().transform((value) => value ?? ""),
  });
}
