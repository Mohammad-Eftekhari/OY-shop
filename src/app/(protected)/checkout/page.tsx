import type { Metadata } from "next";

import { CheckoutView } from "@/features/order/components/CheckoutView";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getDictionary(await getLocale());
  return { title: copy.shop.checkoutTitle };
}

export default async function CheckoutPage() {
  const locale = await getLocale();
  const copy = getDictionary(locale);

  return <CheckoutView copy={copy} locale={locale} />;
}
