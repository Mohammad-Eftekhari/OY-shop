import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageFrame } from "@/components/shared/PageFrame";
import { ProductPurchase } from "@/features/catalog/components/ProductPurchase";
import { productTitle } from "@/features/catalog/lib/product-text";
import { AppError } from "@/lib/api/errors";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getPublishedProduct } from "@/server/services/catalog/catalog-service";

type TProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: TProductPageProps): Promise<Metadata> {
  const [route, locale] = await Promise.all([params, getLocale()]);
  const product = await findProduct(decodeURIComponent(route.slug));

  if (!product) {
    notFound();
  }

  return { title: productTitle(product, locale) };
}

export default async function ProductPage({ params }: TProductPageProps) {
  const [route, locale] = await Promise.all([params, getLocale()]);
  const copy = getDictionary(locale);
  const product = await findProduct(decodeURIComponent(route.slug));

  if (!product) {
    notFound();
  }

  return (
    <PageFrame>
      <ProductPurchase product={product} copy={copy} locale={locale} />
    </PageFrame>
  );
}

async function findProduct(slug: string) {
  try {
    return await getPublishedProduct(slug);
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") {
      return null;
    }

    throw error;
  }
}
