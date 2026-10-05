import Link from "next/link";

import { productPath } from "@/constants/routes";
import { ProductPhoto } from "@/features/catalog/components/ProductPhoto";
import { productTitle } from "@/features/catalog/lib/product-text";
import type { TProduct } from "@/features/catalog/schemas/catalog.schema";
import type { TDictionary } from "@/lib/i18n/en";
import type { TLocale } from "@/lib/locale";
import { formatToman } from "@/utils/format-money";

type TProductCardProps = {
  product: TProduct;
  copy: TDictionary;
  locale: TLocale;
};

export const ProductCard = ({ product, copy, locale }: TProductCardProps) => {
  const title = productTitle(product, locale);
  const typeLabel = product.type === "hoodie" ? copy.shop.hoodie : copy.shop.tshirt;
  const photo = product.images[0];
  const color = product.variants[0]?.color.hex ?? "#e7e0d4";

  return (
    <Link href={productPath(product.slug)} className="group flex flex-col gap-3">
      <ProductPhoto
        url={photo?.url}
        alt={title}
        color={color}
        className="aspect-[3/4] w-full object-cover"
      />
      <div className="flex flex-col gap-1 text-start">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{typeLabel}</p>
        <p className="text-base">{formatToman(product.priceToman, locale)}</p>
      </div>
    </Link>
  );
};
