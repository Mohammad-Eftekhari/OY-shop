"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { EApiRoutes, EAppRoutes, productPath } from "@/constants/routes";
import { ProductGallery } from "@/features/catalog/components/ProductGallery";
import {
  productDescription,
  productTitle,
  sellingPrice,
} from "@/features/catalog/lib/product-text";
import type { TProduct } from "@/features/catalog/schemas/catalog.schema";
import { cartSchema, type TCart } from "@/features/cart/schemas/cart.schema";
import { ApiClientError } from "@/lib/api/client";
import type { TDictionary } from "@/lib/i18n/en";
import type { TLocale } from "@/lib/locale";
import { useSender } from "@/lib/query";
import { formatNumber, formatToman } from "@/utils/format-money";

type TProductPurchaseProps = {
  product: TProduct;
  copy: TDictionary;
  locale: TLocale;
};

export const ProductPurchase = ({ product, copy, locale }: TProductPurchaseProps) => {
  const router = useRouter();
  const colors = uniqueColors(product);
  const [colorId, setColorId] = useState(colors[0]?.id ?? "");
  const sizes = product.variants.filter((variant) => variant.color.id === colorId);
  const [sizeId, setSizeId] = useState(
    sizes.find((variant) => variant.stockQuantity > 0)?.size.id ?? "",
  );
  const selected = product.variants.find(
    (variant) => variant.color.id === colorId && variant.size.id === sizeId,
  );
  const [message, setMessage] = useState<string | null>(null);
  const mutation = useSender<TCart, { variantId: string; quantity: number }>({
    url: EApiRoutes.cartItems,
    method: "PUT",
    schema: cartSchema,
    invalidateKeys: [[EApiRoutes.cart]],
  });

  const title = productTitle(product, locale);
  const description = productDescription(product, locale);
  const typeLabel = product.type === "hoodie" ? copy.shop.hoodie : copy.shop.tshirt;
  const color = colors.find((item) => item.id === colorId);
  const images = imagesForColor(product, colorId);
  const price = sellingPrice(product.priceToman, selected?.priceToman ?? null);
  const compareAt =
    product.compareAtPriceToman !== null && product.compareAtPriceToman > price
      ? product.compareAtPriceToman
      : null;

  function chooseColor(nextColorId: string) {
    setColorId(nextColorId);
    setMessage(null);
    const nextSizes = product.variants.filter((variant) => variant.color.id === nextColorId);
    const available = nextSizes.find((variant) => variant.stockQuantity > 0);
    setSizeId(available?.size.id ?? nextSizes[0]?.size.id ?? "");
  }

  async function addToCart() {
    if (!selected || selected.stockQuantity < 1) {
      setMessage(copy.shop.notEnoughStock);
      return;
    }

    setMessage(null);

    try {
      await mutation.mutateAsync({ variantId: selected.id, quantity: 1 });
      setMessage(copy.shop.added);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        router.push(`${EAppRoutes.signIn}?next=${productPath(product.slug)}`);
        return;
      }

      setMessage(
        error instanceof ApiClientError && error.status === 422
          ? copy.shop.notEnoughStock
          : copy.shop.couldNotAdd,
      );
    }
  }

  const stockText =
    selected && color
      ? copy.shop.inStock
          .replace("{count}", formatNumber(selected.stockQuantity, locale))
          .replace("{color}", locale === "fa" ? color.nameFa : color.nameEn)
          .replace("{size}", selected.size.code)
      : null;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)]">
      <div className="order-1 lg:order-2">
        <ProductGallery
          key={colorId || "all"}
          images={images}
          title={title}
          color={color?.hex ?? "#171614"}
          copy={copy}
          locale={locale}
        />
      </div>
      <div className="order-2 flex flex-col items-end gap-5 text-end lg:order-1">
        <p className="text-sm text-muted-foreground">{typeLabel}</p>
        <h1 className="text-4xl font-medium tracking-tight">{title}</h1>
        {locale === "fa" ? (
          <p className="text-sm text-muted-foreground">{product.titleEn}</p>
        ) : null}
        <p className="flex items-baseline gap-3">
          {compareAt !== null ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatToman(compareAt, locale)}
            </span>
          ) : null}
          <span className="text-lg">{formatToman(price, locale)}</span>
        </p>
        <div className="flex w-full flex-col items-end gap-3">
          <p className="text-sm">
            {copy.shop.color}
            {color ? `: ${locale === "fa" ? color.nameFa : color.nameEn}` : ""}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            {colors.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={locale === "fa" ? item.nameFa : item.nameEn}
                aria-pressed={item.id === colorId}
                className={`size-8 rounded-full border ${item.id === colorId ? "border-foreground p-0.5" : "border-transparent"}`}
                onClick={() => chooseColor(item.id)}
              >
                <span
                  className="block size-full rounded-full"
                  style={{ backgroundColor: item.hex }}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col items-end gap-3">
          <p className="text-sm">{copy.shop.size}</p>
          <div className="flex flex-wrap justify-end gap-2">
            {sizes.map((variant) => {
              const isUnavailable = variant.stockQuantity < 1;
              const isSelected = variant.size.id === sizeId;

              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={isUnavailable}
                  aria-pressed={isSelected}
                  className={`min-w-10 px-3 py-2 text-sm ${
                    isSelected
                      ? "bg-foreground text-background"
                      : "border border-border bg-card text-foreground"
                  } disabled:bg-muted disabled:text-muted-foreground`}
                  onClick={() => {
                    setSizeId(variant.size.id);
                    setMessage(null);
                  }}
                >
                  {variant.size.code}
                  {isUnavailable ? <span className="sr-only"> {copy.shop.unavailable}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
        {stockText ? <p className="text-sm text-muted-foreground">{stockText}</p> : null}
        <Button
          type="button"
          className="h-12 w-full rounded-sm"
          disabled={!selected || selected.stockQuantity < 1 || mutation.isPending}
          onClick={() => {
            void addToCart();
          }}
        >
          {mutation.isPending ? copy.shop.adding : copy.shop.addToCart}
        </Button>
        {message ? <p className="text-sm">{message}</p> : null}
        {description ? (
          <p className="max-w-prose text-sm leading-7 text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
};

function uniqueColors(product: TProduct) {
  const colors = new Map<string, TProduct["variants"][number]["color"]>();

  for (const variant of product.variants) {
    if (!colors.has(variant.color.id)) {
      colors.set(variant.color.id, variant.color);
    }
  }

  return [...colors.values()];
}

function imagesForColor(product: TProduct, colorId: string) {
  const matched = product.images.filter((image) => image.colorId === colorId);
  if (matched.length > 0) {
    return matched;
  }

  const general = product.images.filter((image) => image.colorId === null);
  return general.length > 0 ? general : product.images;
}
