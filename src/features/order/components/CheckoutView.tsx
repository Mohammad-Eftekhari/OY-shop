"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EApiRoutes, EAppRoutes, orderPath } from "@/constants/routes";
import { AddressForm } from "@/features/address/components/AddressForm";
import { addressListSchema } from "@/features/address/schemas/address.schema";
import { cartSchema } from "@/features/cart/schemas/cart.schema";
import { pickLocaleText } from "@/features/catalog/lib/product-text";
import { orderSchema, placeOrderSchema } from "@/features/order/schemas/order.schema";
import { shippingMethodListSchema } from "@/features/shipping/schemas/shipping.schema";
import type { TDictionary } from "@/lib/i18n/en";
import type { TLocale } from "@/lib/locale";
import { useFetcher, useSender } from "@/lib/query";
import { formatNumber, formatToman } from "@/utils/format-money";
import type { z } from "zod";

type TCheckoutViewProps = {
  copy: TDictionary;
  locale: TLocale;
};

export const CheckoutView = ({ copy, locale }: TCheckoutViewProps) => {
  const router = useRouter();
  const cart = useFetcher({ url: EApiRoutes.cart, schema: cartSchema, enabled: true });
  const addresses = useFetcher({
    url: EApiRoutes.addresses,
    schema: addressListSchema,
    enabled: true,
  });
  const shipping = useFetcher({
    url: EApiRoutes.shippingMethods,
    schema: shippingMethodListSchema,
    enabled: true,
  });
  const placeOrder = useSender<z.infer<typeof orderSchema>, z.infer<typeof placeOrderSchema>>({
    url: EApiRoutes.orders,
    method: "POST",
    schema: orderSchema,
    invalidateKeys: [[EApiRoutes.cart], [EApiRoutes.orders]],
  });
  const [addressId, setAddressId] = useState<string | null>(null);
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (cart.isPending || addresses.isPending || shipping.isPending) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (cart.isError || addresses.isError || shipping.isError) {
    return <p className="text-end">{copy.shop.loadError}</p>;
  }

  if (cart.data.items.length === 0) {
    return (
      <div className="flex flex-col items-end gap-4 text-end">
        <h1 className="text-4xl font-medium">{copy.shop.cartEmpty}</h1>
        <Button asChild variant="outline">
          <Link href={EAppRoutes.products}>{copy.shop.backToShop}</Link>
        </Button>
      </div>
    );
  }

  const selectedAddress =
    addresses.data.items.find((item) => item.id === addressId) ??
    addresses.data.items.find((item) => item.isDefault) ??
    addresses.data.items[0];
  const selectedShipping =
    shipping.data.items.find((item) => item.id === shippingMethodId) ?? shipping.data.items[0];
  const subtotal = cart.data.items.reduce((sum, item) => sum + item.lineTotalToman, 0);
  const shippingToman = selectedShipping?.priceToman ?? 0;
  const total = subtotal + shippingToman;

  async function pay() {
    if (!selectedAddress || !selectedShipping) {
      return;
    }

    const order = await placeOrder.mutateAsync({
      addressId: selectedAddress.id,
      shippingMethodId: selectedShipping.id,
    });
    router.push(orderPath(order.orderNumber));
    router.refresh();
  }

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <aside className="flex flex-col gap-3 lg:col-start-2 lg:row-start-1">
        <h2 className="text-lg font-medium">{copy.shop.summary}</h2>
        {cart.data.items.map((item) => (
          <p key={item.variantId} className="text-sm text-muted-foreground">
            {pickLocaleText(locale, item.productTitleFa, item.productTitleEn)} · {item.sizeCode}
          </p>
        ))}
        <p className="flex justify-between text-sm">
          <span className="text-muted-foreground">{copy.shop.subtotal}</span>
          <span>{formatToman(subtotal, locale)}</span>
        </p>
        <p className="flex justify-between text-sm">
          <span className="text-muted-foreground">{copy.shop.shipping}</span>
          <span>{formatToman(shippingToman, locale)}</span>
        </p>
        <p className="flex justify-between text-sm">
          <span className="text-muted-foreground">{copy.shop.discount}</span>
          <span>{formatToman(0, locale)}</span>
        </p>
        <p className="text-2xl font-medium">{formatToman(total, locale)}</p>
        <Button
          type="button"
          className="h-12 rounded-sm"
          disabled={!selectedAddress || !selectedShipping || placeOrder.isPending}
          onClick={() => void pay()}
        >
          {placeOrder.isPending ? copy.shop.paying : copy.shop.payOnline}
        </Button>
        <p className="text-sm text-muted-foreground">{copy.shop.noCash}</p>
        {placeOrder.isError ? (
          <p className="text-sm text-destructive">{copy.shop.couldNotPlace}</p>
        ) : null}
      </aside>
      <div className="flex flex-col items-end gap-6 text-end lg:col-start-1 lg:row-start-1">
        <h1 className="text-4xl font-medium">{copy.shop.checkoutTitle}</h1>
        <h2 className="text-lg font-medium">{copy.shop.addressTitle}</h2>
        {addresses.data.items.length === 0 ? (
          <p className="text-muted-foreground">{copy.shop.noAddress}</p>
        ) : null}
        <div className="flex w-full flex-col gap-3">
          {addresses.data.items.map((address) => {
            const isSelected = address.id === selectedAddress?.id;
            return (
              <button
                key={address.id}
                type="button"
                className={`border p-4 text-end ${isSelected ? "border-foreground" : "border-border"}`}
                onClick={() => setAddressId(address.id)}
              >
                <span className="block text-lg font-medium">{address.receiverName}</span>
                <span className="block">{address.mobile}</span>
                <span className="block text-muted-foreground">
                  {address.city}، {address.addressLine}
                </span>
                <span className="block text-sm">
                  {address.postalCode}
                  {address.isDefault ? ` · ${copy.shop.defaultAddress}` : ""}
                </span>
              </button>
            );
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-sm"
          onClick={() => setIsFormOpen((open) => !open)}
        >
          {copy.shop.newAddress}
        </Button>
        {isFormOpen ? (
          <AddressForm
            copy={copy}
            onSaved={(address) => {
              setAddressId(address.id);
              setIsFormOpen(false);
            }}
          />
        ) : null}
        <h2 className="text-lg font-medium">{copy.shop.shippingTitle}</h2>
        {shipping.data.items.length === 0 ? <p>{copy.shop.noShipping}</p> : null}
        <div className="flex w-full flex-col gap-3">
          {shipping.data.items.map((method) => {
            const isSelected = method.id === selectedShipping?.id;
            const days = copy.shop.daysRange
              .replace("{min}", formatNumber(method.estimatedDaysMin, locale))
              .replace("{max}", formatNumber(method.estimatedDaysMax, locale));

            return (
              <button
                key={method.id}
                type="button"
                className={`flex items-center justify-between border p-4 ${isSelected ? "border-foreground" : "border-border"}`}
                onClick={() => setShippingMethodId(method.id)}
              >
                <span className="font-medium">
                  {pickLocaleText(locale, method.nameFa, method.nameEn)}
                </span>
                <span>
                  {days} · {formatToman(method.priceToman, locale)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
