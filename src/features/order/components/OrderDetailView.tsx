"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { orderApiPath } from "@/constants/routes";
import { EOrderStatus } from "@/constants/shop";
import { statusLabel } from "@/features/order/components/OrderList";
import { orderSchema } from "@/features/order/schemas/order.schema";
import { pickLocaleText } from "@/features/catalog/lib/product-text";
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
    return <Skeleton className="h-48 w-full" />;
  }

  if (order.isError) {
    return (
      <div className="flex flex-col items-end gap-3">
        <p>{copy.shop.loadError}</p>
        <Button type="button" variant="outline" onClick={() => void order.refetch()}>
          {copy.shop.tryAgain}
        </Button>
      </div>
    );
  }

  const current = order.data;
  const isPending = current.status === EOrderStatus.pendingPayment;

  return (
    <article className="flex flex-col items-end gap-4 text-end">
      <div className="flex items-center gap-3">
        <h1 className="text-4xl font-medium">
          {isPending
            ? copy.shop.orderPlaced.replace("{number}", current.orderNumber)
            : current.orderNumber}
        </h1>
        <span className="rounded-full bg-muted px-3 py-1 text-sm">
          {statusLabel(copy, current.status)}
        </span>
      </div>
      {isPending ? <p className="text-muted-foreground">{copy.shop.paymentWindow}</p> : null}
      <ul className="flex flex-col items-end gap-2">
        {current.items.map((item) => (
          <li key={item.id}>
            {pickLocaleText(locale, item.productTitleFa, item.productTitleEn)} ·{" "}
            {pickLocaleText(locale, item.colorNameFa, item.colorNameEn)} · {item.sizeCode} ·{" "}
            {item.quantity} × {formatToman(item.unitPriceToman, locale)}
          </li>
        ))}
      </ul>
      <p>
        {copy.shop.shipping}:{" "}
        {pickLocaleText(locale, current.shippingNameFa, current.shippingNameEn)} ·{" "}
        {formatToman(current.shippingToman, locale)}
      </p>
      <p className="text-lg font-medium">{current.receiverName}</p>
      <p className="text-muted-foreground">
        {current.province}، {current.city}، {current.addressLine}، {current.postalCode}
      </p>
      <p className="text-muted-foreground">{current.mobile}</p>
      {current.trackingCode ? (
        <p>
          {copy.shop.tracking}: {current.trackingCode}
        </p>
      ) : null}
      <p className="text-lg">
        {copy.shop.amountDue}: {formatToman(current.totalToman, locale)}
      </p>
    </article>
  );
};
