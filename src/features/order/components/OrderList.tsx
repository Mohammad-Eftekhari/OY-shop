"use client";

import { ChevronRight, ChevronLeft, Package } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EApiRoutes, orderPath } from "@/constants/routes";
import { EOrderStatus, type TOrderStatus } from "@/constants/shop";
import { paginatedOrdersSchema } from "@/features/order/schemas/order.schema";
import type { TDictionary } from "@/lib/i18n/en";
import type { TLocale } from "@/lib/locale";
import { useFetcher } from "@/lib/query";
import { formatToman } from "@/utils/format-money";

type TOrderListProps = {
  copy: TDictionary;
  locale: TLocale;
};

export const OrderList = ({ copy, locale }: TOrderListProps) => {
  const ChevronIcon = locale === "fa" ? ChevronLeft : ChevronRight;
  const orders = useFetcher({
    url: EApiRoutes.orders,
    schema: paginatedOrdersSchema,
    params: { page: 1, pageSize: 20 },
    enabled: true,
  });

  if (orders.isPending) {
    return (
      <div className="flex max-w-3xl flex-col gap-3">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (orders.isError) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-start">
        <p className="text-sm text-destructive">{copy.shop.loadError}</p>
        <Button type="button" variant="outline" onClick={() => void orders.refetch()}>
          {copy.shop.tryAgain}
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex max-w-3xl flex-col items-start gap-8 text-start">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Purchase History
        </span>
        <h1 className="text-3xl font-normal tracking-tight md:text-4xl">{copy.shop.ordersTitle}</h1>
      </div>

      {orders.data.items.length === 0 ? (
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 py-16 text-center">
          <Package className="size-10 text-muted-foreground/60" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">{copy.shop.emptyOrders}</p>
        </div>
      ) : null}

      <ul className="flex w-full flex-col gap-3">
        {orders.data.items.map((order) => (
          <li key={order.orderNumber}>
            <Link
              href={orderPath(order.orderNumber)}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all duration-150 hover:border-foreground/30 hover:shadow-xs active:scale-[0.99]"
            >
              <div className="flex flex-col items-start gap-2">
                <span className="font-semibold text-base tracking-tight group-hover:underline">
                  #{order.orderNumber}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle(
                    order.status,
                  )}`}
                >
                  {statusLabel(copy, order.status)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-base font-medium tracking-tight">
                  {formatToman(order.totalToman, locale)}
                </span>
                <ChevronIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export function statusLabel(copy: TDictionary, status: TOrderStatus) {
  if (status === EOrderStatus.pendingPayment) return copy.shop.status.pending_payment;
  if (status === EOrderStatus.paid) return copy.shop.status.paid;
  if (status === EOrderStatus.processing) return copy.shop.status.processing;
  if (status === EOrderStatus.shipped) return copy.shop.status.shipped;
  if (status === EOrderStatus.delivered) return copy.shop.status.delivered;
  if (status === EOrderStatus.cancelled) return copy.shop.status.cancelled;
  return copy.shop.status.payment_failed;
}

export function statusStyle(status: TOrderStatus) {
  if (status === EOrderStatus.pendingPayment) {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20";
  }
  if (status === EOrderStatus.paid || status === EOrderStatus.processing) {
    return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20";
  }
  if (status === EOrderStatus.shipped || status === EOrderStatus.delivered) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
  }
  return "bg-destructive/10 text-destructive border border-destructive/20";
}
