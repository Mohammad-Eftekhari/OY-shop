"use client";

import { Clock, MapPin, Package, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { orderApiPath } from "@/constants/routes";
import { EOrderStatus } from "@/constants/shop";
import { pickLocaleText } from "@/features/catalog/lib/product-text";
import { statusLabel, statusStyle } from "@/features/order/components/OrderList";
import { orderSchema } from "@/features/order/schemas/order.schema";
import type { TDictionary } from "@/lib/i18n/en";
import type { TLocale } from "@/lib/locale";
import { useFetcher } from "@/lib/query";
import { formatToman } from "@/utils/format-money";

type TOrderDetailProps = {
  copy: TDictionary;
  locale: TLocale;
  orderNumber: string;
};

export const OrderDetailView = ({ copy, locale, orderNumber }: TOrderDetailProps) => {
  const order = useFetcher({
    url: orderApiPath(orderNumber),
    schema: orderSchema,
    enabled: true,
  });

  if (order.isPending) {
    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (order.isError) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-start">
        <p className="text-sm text-destructive">{copy.shop.loadError}</p>
        <Button type="button" variant="outline" onClick={() => void order.refetch()}>
          {copy.shop.tryAgain}
        </Button>
      </div>
    );
  }

  const current = order.data;
  const isPending = current.status === EOrderStatus.pendingPayment;

  return (
    <article className="animate-fade-in flex max-w-3xl flex-col items-start gap-8 text-start">
      {/* Header */}
      <div className="flex w-full flex-col gap-2 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Order Details
            </span>
            <h1 className="text-3xl font-normal tracking-tight md:text-4xl">
              #{current.orderNumber}
            </h1>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyle(
              current.status,
            )}`}
          >
            {statusLabel(copy, current.status)}
          </span>
        </div>

        {isPending ? (
          <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300">
            <Clock className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p>{copy.shop.paymentWindow}</p>
          </div>
        ) : null}
      </div>

      {/* Items list */}
      <section className="flex w-full flex-col gap-4">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">{copy.shop.products}</h2>
        </div>

        <ul className="flex flex-col gap-3">
          {current.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-2xs"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium text-sm">
                  {pickLocaleText(locale, item.productTitleFa, item.productTitleEn)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {pickLocaleText(locale, item.colorNameFa, item.colorNameEn)} · {item.sizeCode} ·{" "}
                  {item.quantity} × {formatToman(item.unitPriceToman, locale)}
                </span>
              </div>
              <span className="font-semibold text-sm">
                {formatToman(item.lineTotalToman, locale)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Shipping & Delivery */}
      <section className="grid w-full gap-4 sm:grid-cols-2">
        {/* Shipping info */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2">
            <Truck className="size-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">{copy.shop.shipping}</h3>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{copy.shop.shippingTitle}:</span>
              <span className="font-medium">
                {pickLocaleText(locale, current.shippingNameFa, current.shippingNameEn)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{copy.shop.shipping}:</span>
              <span className="font-medium">{formatToman(current.shippingToman, locale)}</span>
            </div>
            {current.trackingCode ? (
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">{copy.shop.tracking}:</span>
                <span className="font-mono font-medium">{current.trackingCode}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Address info */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2">
            <MapPin className="size-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">{copy.shop.addressTitle}</h3>
          </div>
          <div className="flex flex-col gap-1 text-xs leading-relaxed">
            <span className="font-medium text-foreground">{current.receiverName}</span>
            <span className="text-muted-foreground">{current.mobile}</span>
            <span className="text-muted-foreground">
              {current.province}، {current.city}، {current.addressLine}
            </span>
            <span className="text-muted-foreground">{current.postalCode}</span>
          </div>
        </div>
      </section>

      {/* Total amount */}
      <div className="flex w-full items-baseline justify-between rounded-2xl border border-border/80 bg-muted/40 p-5 shadow-2xs">
        <span className="text-sm font-semibold">{copy.shop.amountDue}</span>
        <span className="text-2xl font-medium tracking-tight">
          {formatToman(current.totalToman, locale)}
        </span>
      </div>
    </article>
  );
};
