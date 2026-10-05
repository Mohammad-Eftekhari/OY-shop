import type { Metadata } from "next";

import { OrderDetailView } from "@/features/order/components/OrderDetailView";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type TOrderPageProps = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({ params }: TOrderPageProps): Promise<Metadata> {
  const route = await params;
  return { title: decodeURIComponent(route.orderNumber) };
}

export default async function OrderPage({ params }: TOrderPageProps) {
  const [route, locale] = await Promise.all([params, getLocale()]);
  const copy = getDictionary(locale);

  return (
    <OrderDetailView
      copy={copy}
      locale={locale}
      orderNumber={decodeURIComponent(route.orderNumber)}
    />
  );
}
