"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EApiRoutes } from "@/constants/routes";
import { addressSchema, type TAddress } from "@/features/address/schemas/address.schema";
import type { TDictionary } from "@/lib/i18n/en";
import { createAddressFormSchema } from "@/lib/i18n/schemas";
import { useSender } from "@/lib/query";

type TAddressFormValues = z.infer<ReturnType<typeof createAddressFormSchema>>;

type TAddressFormProps = {
  copy: TDictionary;
  onSaved?: (address: TAddress) => void;
};

export const AddressForm = ({ copy, onSaved }: TAddressFormProps) => {
  const schema = useMemo(() => createAddressFormSchema(copy.validation), [copy.validation]);
  const form = useForm<TAddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      receiverName: "",
      mobile: "",
      province: "",
      city: "",
      postalCode: "",
      addressLine: "",
      isDefault: false,
    },
  });
  const mutation = useSender<TAddress, TAddressFormValues>({
    url: EApiRoutes.addresses,
    method: "POST",
    schema: addressSchema,
    invalidateKeys: [[EApiRoutes.addresses]],
  });

  async function onSubmit(values: TAddressFormValues) {
    const saved = await mutation.mutateAsync(values);
    form.reset();
    onSaved?.(saved);
  }

  const fields = [
    ["receiverName", copy.shop.receiver],
    ["mobile", copy.shop.mobile],
    ["province", copy.shop.province],
    ["city", copy.shop.city],
    ["postalCode", copy.shop.postalCode],
    ["addressLine", copy.shop.addressLine],
  ] as const;

  return (
    <form
      className="flex max-w-lg flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      {fields.map(([name, label]) => (
        <Controller
          key={name}
          name={name}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`address-${name}`}>{label}</FieldLabel>
              <Input {...field} id={`address-${name}`} aria-invalid={fieldState.invalid} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      ))}
      <Controller
        name="isDefault"
        control={form.control}
        render={({ field }) => (
          <label className="flex items-center justify-end gap-2 text-sm">
            <span>{copy.shop.defaultAddress}</span>
            <input
              type="checkbox"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
            />
          </label>
        )}
      />
      {mutation.isError ? (
        <p className="text-sm text-destructive">{copy.shop.couldNotPlace}</p>
      ) : null}
      <Button type="submit" className="h-12 rounded-sm" disabled={mutation.isPending}>
        {mutation.isPending ? copy.shop.savingAddress : copy.shop.saveAddress}
      </Button>
    </form>
  );
};
