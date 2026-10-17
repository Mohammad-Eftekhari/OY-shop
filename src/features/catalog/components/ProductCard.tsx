import Link from "next/link";

import { productPath } from "@/constants/routes";
import { ProductPhoto } from "@/features/catalog/components/ProductPhoto";
import { productColors, productTitle } from "@/features/catalog/lib/product-text";
import type { TProduct } from "@/features/catalog/schemas/catalog.schema";
import type { TDictionary } from "@/lib/i18n/en";
import { ELocale, type TLocale } from "@/lib/locale";
import { formatToman } from "@/utils/format-money";

type TProductCardProps = {
  product: TProduct;
  copy: TDictionary;
  locale: TLocale;
};

export const ProductCard = ({ product, copy, locale }: TProductCardProps) => {
  const title = productTitle(product, locale);
  const photo = product.images[0];
  const colors = productColors(product);
  const color = colors[0]?.hex ?? "#f3f3f3";
  const compareAt =
    product.compareAtPriceToman !== null && product.compareAtPriceToman > product.priceToman
      ? product.compareAtPriceToman
      : null;

  return (
    <Link href={productPath(product.slug)} className="group flex flex-col gap-3">
      <ProductPhoto
        url={photo?.url}
        alt={title}
        color={color}
        className="aspect-[3/4] w-full object-cover"
      />
      <div className="flex flex-col items-start gap-2 text-start">
        <h2 className="text-sm tracking-normal">{title}</h2>
        {colors.length > 0 ? (
          <div className="flex gap-1">
            {colors.slice(0, 6).map((item) => (
              <span
                key={item.id}
                className="size-3 border border-border"
                style={{ backgroundColor: item.hex }}
              />
            ))}
            <span className="sr-only">
              {copy.shop.color}:{" "}
              {colors.map((item) => (locale === ELocale.fa ? item.nameFa : item.nameEn)).join(", ")}
            </span>
          </div>
        ) : null}
        <p className="flex items-baseline gap-2 text-sm">
          {compareAt !== null ? (
            <span className="text-muted-foreground line-through">
              {formatToman(compareAt, locale)}
            </span>
          ) : null}
          <span>{formatToman(product.priceToman, locale)}</span>
        </p>
      </div>
    </Link>
  );
};
