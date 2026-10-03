"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EApiRoutes, orderPath } from "@/constants/routes";
import { paginatedOrdersSchema } from "@/features/order/schemas/order.schema";
import type { TDictionary } from "@/lib/i18n/en";
import { EOrderStatus, type TOrderStatus } from "@/constants/shop";
import type { TLocale } from "@/lib/locale";
import { useFetcher } from "@/lib/query";
import { formatToman } from "@/utils/format-money";

type TOrderListProps = {
  copy: TDictionary;
  locale: TLocale;
};

export const OrderList = ({ copy, locale }: TOrderListProps) => {
  const orders = useFetcher({
    url: EApiRoutes.orders,
    schema: paginatedOrdersSchema,
    params: { page: 1, pageSize: 20 },
    enabled: true,
  });

  if (orders.isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (orders.isError) {
    return (
      <div className="flex flex-col items-end gap-3">
        <p>{copy.shop.loadError}</p>
        <Button type="button" variant="outline" onClick={() => void orders.refetch()}>
          {copy.shop.tryAgain}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-6">
      <h1 className="text-4xl font-medium">{copy.shop.ordersTitle}</h1>
      {orders.data.items.length === 0 ? (
        <p className="text-muted-foreground">{copy.shop.emptyOrders}</p>
      ) : null}
      <ul className="w-full">
        {orders.data.items.map((order) => (
          <li key={order.orderNumber} className="border-b py-4">
            <Link href={orderPath(order.orderNumber)} className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {statusLabel(copy, order.status)}
              </span>
              <span>{formatToman(order.totalToman, locale)}</span>
              <span className="ms-auto text-lg font-medium">{order.orderNumber}</span>
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
