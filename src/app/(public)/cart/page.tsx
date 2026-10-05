import type { Metadata } from "next";

import { PageFrame } from "@/components/shared/PageFrame";
import { CartView } from "@/features/cart/components/CartView";
import { getCurrentUser } from "@/lib/auth/server";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getDictionary(await getLocale());
  return { title: copy.shop.cartTitle };
}

export default async function CartPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const copy = getDictionary(locale);

  return (
    <PageFrame>
      <CartView copy={copy} locale={locale} isSignedIn={user !== null} />
    </PageFrame>
  );
}
