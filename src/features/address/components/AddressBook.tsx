"use client";

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
    return <Skeleton className="h-40 w-full" />;
  }

  if (addresses.isError) {
    return (
      <div className="flex flex-col items-end gap-3">
        <p>{copy.shop.loadError}</p>
        <Button type="button" variant="outline" onClick={() => void addresses.refetch()}>
          {copy.shop.tryAgain}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-8">
      <div className="text-end">
        <h1 className="text-4xl font-medium">{copy.shop.addressesTitle}</h1>
        <p className="mt-2 text-muted-foreground">{copy.shop.oneDefault}</p>
      </div>
      <ul className="flex w-full flex-col gap-3">
        {addresses.data.items.map((address) => (
          <li
            key={address.id}
            className={`flex flex-col items-end gap-1 border p-4 text-end ${address.isDefault ? "border-foreground" : "border-border"}`}
          >
            <p className="text-lg font-medium">{address.receiverName}</p>
            <p>{address.mobile}</p>
            <p className="text-muted-foreground">
              {address.province}، {address.city}
            </p>
            <p className="text-muted-foreground">{address.addressLine}</p>
            <p className="text-sm">
              {address.postalCode}
              {address.isDefault ? ` · ${copy.shop.defaultAddress}` : ""}
            </p>
            <div className="mt-2 flex gap-4 text-sm">
              {address.isDefault ? null : (
                <button
                  type="button"
                  className="underline-offset-4 hover:underline"
                  onClick={() => makeDefault.mutate(address.id)}
                >
                  {copy.shop.makeDefault}
                </button>
              )}
              <button
                type="button"
                className="underline-offset-4 hover:underline"
                onClick={() => remove.mutate(address.id)}
              >
                {copy.shop.deleteAddress}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="outline"
        className="rounded-sm"
        onClick={() => setIsFormOpen((open) => !open)}
      >
        {copy.shop.newAddress}
      </Button>
      {isFormOpen ? <AddressForm copy={copy} onSaved={() => setIsFormOpen(false)} /> : null}
    </div>
  );
};
