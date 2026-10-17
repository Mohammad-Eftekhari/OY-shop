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
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted/60 transition-shadow duration-300 group-hover:shadow-md">
        <ProductPhoto
          url={photo?.url}
          alt={title}
          color={color}
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {compareAt !== null ? (
          <span className="absolute top-3 start-3 rounded-full bg-destructive/90 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-white shadow-xs backdrop-blur-xs">
            Sale
          </span>
        ) : null}
      </div>
      <div className="flex flex-col items-start gap-1.5 px-0.5 text-start">
        <div className="flex w-full items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium tracking-tight text-foreground transition-colors duration-150 group-hover:text-foreground/80">
            {title}
          </h2>
          <p className="flex shrink-0 items-baseline gap-1.5 text-xs font-semibold">
            {compareAt !== null ? (
              <span className="font-normal text-muted-foreground line-through">
                {formatToman(compareAt, locale)}
              </span>
            ) : null}
            <span>{formatToman(product.priceToman, locale)}</span>
          </p>
        </div>
        {colors.length > 0 ? (
          <div className="flex items-center gap-1.5 pt-0.5">
            {colors.slice(0, 6).map((item) => (
              <span
                key={item.id}
                className="size-2.5 rounded-full border border-black/15 shadow-2xs transition-transform duration-150 group-hover:scale-110 dark:border-white/20"
                style={{ backgroundColor: item.hex }}
              />
            ))}
            {colors.length > 6 ? (
              <span className="text-[10px] text-muted-foreground">+{colors.length - 6}</span>
            ) : null}
            <span className="sr-only">
              {copy.shop.color}:{" "}
              {colors.map((item) => (locale === ELocale.fa ? item.nameFa : item.nameEn)).join(", ")}
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
};
