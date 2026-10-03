import type { Metadata } from "next";

import { OrderList } from "@/features/order/components/OrderList";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getDictionary(await getLocale());
  return { title: copy.shop.ordersTitle };
}

export default async function OrdersPage() {
  const locale = await getLocale();
  const copy = getDictionary(locale);

  return <OrderList copy={copy} locale={locale} />;
}
