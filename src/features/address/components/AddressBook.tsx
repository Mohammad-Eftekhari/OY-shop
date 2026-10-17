"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EApiRoutes } from "@/constants/routes";
import { AddressForm } from "@/features/address/components/AddressForm";
import {
  addressListSchema,
  addressSchema,
  deletedAddressSchema,
} from "@/features/address/schemas/address.schema";
import { apiFetch } from "@/lib/api/client";
import type { TDictionary } from "@/lib/i18n/en";
import { useFetcher } from "@/lib/query";

type TAddressBookProps = {
  copy: TDictionary;
};

export const AddressBook = ({ copy }: TAddressBookProps) => {
  const queryClient = useQueryClient();
  const addresses = useFetcher({
    url: EApiRoutes.addresses,
    schema: addressListSchema,
    enabled: true,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const remove = useMutation({
    mutationFn: (addressId: string) =>
      apiFetch(`${EApiRoutes.addresses}/${addressId}`, deletedAddressSchema, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [EApiRoutes.addresses] });
    },
  });
  const makeDefault = useMutation({
    mutationFn: (addressId: string) =>
      apiFetch(`${EApiRoutes.addresses}/${addressId}`, addressSchema, {
        method: "PATCH",
        body: JSON.stringify({ isDefault: true }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [EApiRoutes.addresses] });
    },
  });

  if (addresses.isPending) {
    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  }

  if (addresses.isError) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-start">
        <p className="text-sm text-destructive">{copy.shop.loadError}</p>
        <Button type="button" variant="outline" onClick={() => void addresses.refetch()}>
          {copy.shop.tryAgain}
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex max-w-3xl flex-col items-start gap-8">
      <div className="text-start">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Shipping & Delivery
        </span>
        <h1 className="text-3xl font-normal tracking-tight md:text-4xl">
          {copy.shop.addressesTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.shop.oneDefault}</p>
      </div>

      <ul className="grid w-full gap-4 sm:grid-cols-2">
        {addresses.data.items.map((address) => (
          <li
            key={address.id}
            className={`flex flex-col items-start justify-between gap-3 rounded-2xl border p-5 text-start shadow-2xs transition-all duration-150 ${
              address.isDefault
                ? "border-foreground bg-card ring-1 ring-foreground/20"
                : "border-border/80 bg-card hover:border-foreground/30"
            }`}
          >
            <div className="flex w-full flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-base">{address.receiverName}</span>
                {address.isDefault ? (
                  <span className="rounded-full bg-foreground px-2.5 py-0.5 text-[11px] font-medium text-background">
                    {copy.shop.defaultAddress}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-foreground/80">{address.mobile}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {address.province}، {address.city}، {address.addressLine}
              </p>
              <p className="text-[11px] text-muted-foreground">{address.postalCode}</p>
            </div>

            <div className="flex w-full items-center justify-between border-t border-border/50 pt-3 text-xs">
              {address.isDefault ? (
                <span />
              ) : (
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                  onClick={() => makeDefault.mutate(address.id)}
                >
                  {copy.shop.makeDefault}
                </button>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-destructive"
                onClick={() => remove.mutate(address.id)}
              >
                <Trash2 className="size-3" />
                <span>{copy.shop.deleteAddress}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant="outline"
        className="gap-2 rounded-full font-medium"
        onClick={() => setIsFormOpen((open) => !open)}
      >
        <Plus className="size-4" />
        <span>{copy.shop.newAddress}</span>
      </Button>

      {isFormOpen ? (
        <div className="w-full rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
          <AddressForm copy={copy} onSaved={() => setIsFormOpen(false)} />
        </div>
      ) : null}
    </div>
  );
};
