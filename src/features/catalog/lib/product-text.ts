import type { TProduct } from "@/features/catalog/schemas/catalog.schema";
import { ELocale, type TLocale } from "@/lib/locale";

export function pickLocaleText(locale: TLocale, fa: string, en: string) {
  return locale === ELocale.fa ? fa : en;
}

export function productTitle(product: Pick<TProduct, "titleFa" | "titleEn">, locale: TLocale) {
  return pickLocaleText(locale, product.titleFa, product.titleEn);
}

export function productDescription(
  product: Pick<TProduct, "descriptionFa" | "descriptionEn">,
  locale: TLocale,
) {
  return pickLocaleText(locale, product.descriptionFa, product.descriptionEn);
}

export function sellingPrice(productPrice: number, variantPrice: number | null) {
  return variantPrice ?? productPrice;
}
