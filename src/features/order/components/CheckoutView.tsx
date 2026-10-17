"use client";

import { Check, CreditCard, MapPin, Truck } from "lucide-react";
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
    return (
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (cart.isError || addresses.isError || shipping.isError) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-start">
        <p className="text-sm text-destructive">{copy.shop.loadError}</p>
      </div>
    );
  }

  if (cart.data.items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 text-start">
        <h1 className="text-3xl md:text-4xl">{copy.shop.cartEmpty}</h1>
        <Button asChild variant="outline" className="rounded-full">
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
    <div className="animate-fade-in grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
      {/* Checkout Sidebar Summary */}
      <aside className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
        <h2 className="text-start text-base font-semibold tracking-tight">{copy.shop.summary}</h2>

        <div className="flex flex-col gap-2 border-b border-border/60 pb-3 text-xs">
          {cart.data.items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-muted-foreground">
              <span>
                {pickLocaleText(locale, item.productTitleFa, item.productTitleEn)} ({item.sizeCode})
              </span>
              <span>{formatToman(item.lineTotalToman, locale)}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-b border-border/60 pb-3 text-sm">
          <p className="flex justify-between">
            <span className="text-muted-foreground">{copy.shop.subtotal}</span>
            <span>{formatToman(subtotal, locale)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted-foreground">{copy.shop.shipping}</span>
            <span>{formatToman(shippingToman, locale)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted-foreground">{copy.shop.discount}</span>
            <span>{formatToman(0, locale)}</span>
          </p>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <span className="text-sm font-semibold">{copy.shop.total}</span>
          <span className="text-2xl font-medium tracking-tight">{formatToman(total, locale)}</span>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full gap-2 rounded-full font-medium"
          disabled={!selectedAddress || !selectedShipping || placeOrder.isPending}
          onClick={() => void pay()}
        >
          <CreditCard className="size-4" />
          <span>{placeOrder.isPending ? copy.shop.paying : copy.shop.payOnline}</span>
        </Button>

        <p className="text-start text-xs text-muted-foreground leading-relaxed">
          {copy.shop.noCash}
        </p>

        {placeOrder.isError ? (
          <p className="text-start text-xs text-destructive">{copy.shop.couldNotPlace}</p>
        ) : null}
      </aside>

      {/* Main Checkout Steps */}
      <div className="flex flex-col items-start gap-8 text-start lg:col-start-1 lg:row-start-1">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Order
          </span>
          <h1 className="text-3xl font-normal tracking-tight md:text-4xl">
            {copy.shop.checkoutTitle}
          </h1>
        </div>

        {/* Step 1: Address */}
        <section className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2">
            <MapPin className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">{copy.shop.addressTitle}</h2>
          </div>

          {addresses.data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{copy.shop.noAddress}</p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.data.items.map((address) => {
              const isSelected = address.id === selectedAddress?.id;
              return (
                <button
                  key={address.id}
                  type="button"
                  className={`flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-start transition-all duration-150 active:scale-98 ${
                    isSelected
                      ? "border-foreground bg-muted/40 shadow-xs ring-1 ring-foreground"
                      : "border-border/80 bg-card hover:border-foreground/30 hover:bg-muted/20"
                  }`}
                  onClick={() => setAddressId(address.id)}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-semibold text-sm">{address.receiverName}</span>
                    {isSelected ? (
                      <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                        <Check className="size-3" />
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs text-foreground/80">{address.mobile}</span>
                  <span className="text-xs text-muted-foreground">
                    {address.province}، {address.city}، {address.addressLine}
                  </span>
                  <span className="mt-1 text-[11px] text-muted-foreground">
                    {address.postalCode}
                    {address.isDefault ? ` · ${copy.shop.defaultAddress}` : ""}
                  </span>
                </button>
              );
            })}
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setIsFormOpen((open) => !open)}
            >
              {copy.shop.newAddress}
            </Button>
          </div>

          {isFormOpen ? (
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <AddressForm
                copy={copy}
                onSaved={(address) => {
                  setAddressId(address.id);
                  setIsFormOpen(false);
                }}
              />
            </div>
          ) : null}
        </section>

        {/* Step 2: Shipping */}
        <section className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2">
            <Truck className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">{copy.shop.shippingTitle}</h2>
          </div>

          {shipping.data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{copy.shop.noShipping}</p>
          ) : null}

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
                  className={`flex items-center justify-between rounded-2xl border p-4.5 text-start transition-all duration-150 active:scale-98 ${
                    isSelected
                      ? "border-foreground bg-muted/40 shadow-xs ring-1 ring-foreground"
                      : "border-border/80 bg-card hover:border-foreground/30 hover:bg-muted/20"
                  }`}
                  onClick={() => setShippingMethodId(method.id)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-4.5 items-center justify-center rounded-full border transition-colors ${
                        isSelected ? "border-foreground bg-foreground" : "border-muted-foreground"
                      }`}
                    >
                      {isSelected ? <span className="size-1.5 rounded-full bg-background" /> : null}
                    </span>
                    <span className="font-medium text-sm">
                      {pickLocaleText(locale, method.nameFa, method.nameEn)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                      {days}
                    </span>
                    <span className="font-semibold text-sm">
                      {formatToman(method.priceToman, locale)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
