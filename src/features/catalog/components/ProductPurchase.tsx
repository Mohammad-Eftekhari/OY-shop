"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { EApiRoutes, EAppRoutes, productPath } from "@/constants/routes";
import { ProductGallery } from "@/features/catalog/components/ProductGallery";
import {
  productColors,
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
  const colors = productColors(product);
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
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,26rem)] lg:gap-16">
      <ProductGallery
        key={colorId || "all"}
        images={images}
        title={title}
        color={color?.hex ?? "#161616"}
        copy={copy}
        locale={locale}
      />
      <div className="flex flex-col items-start gap-6 text-start lg:sticky lg:top-24">
        <div className="flex flex-col items-start gap-2">
          <span className="rounded-full bg-muted/80 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {typeLabel}
          </span>
          <h1 className="text-3xl font-normal tracking-tight md:text-4xl">{title}</h1>
          {locale === "fa" && product.titleEn ? (
            <p className="text-sm font-light text-muted-foreground">{product.titleEn}</p>
          ) : null}
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-3">
          {compareAt !== null ? (
            <span className="text-base text-muted-foreground line-through">
              {formatToman(compareAt, locale)}
            </span>
          ) : null}
          <span className="text-2xl font-medium tracking-tight">{formatToman(price, locale)}</span>
        </div>

        {/* Color Palette Selection */}
        <div className="flex w-full flex-col items-start gap-3 border-t border-border/60 pt-5">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {copy.shop.color}
            </span>
            {color ? (
              <span className="text-xs font-medium text-foreground">
                {locale === "fa" ? color.nameFa : color.nameEn}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-start gap-2.5">
            {colors.map((item) => {
              const isSelected = item.id === colorId;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={locale === "fa" ? item.nameFa : item.nameEn}
                  aria-pressed={isSelected}
                  className={`size-7 rounded-full p-0.5 transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none ${
                    isSelected
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : "ring-1 ring-border hover:ring-foreground/40"
                  }`}
                  onClick={() => chooseColor(item.id)}
                >
                  <span
                    className="block size-full rounded-full shadow-2xs"
                    style={{ backgroundColor: item.hex }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Size Selection */}
        <div className="flex w-full flex-col items-start gap-3 border-t border-border/60 pt-5">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {copy.shop.size}
          </span>
          <div className="flex flex-wrap justify-start gap-2">
            {sizes.map((variant) => {
              const isUnavailable = variant.stockQuantity < 1;
              const isSelected = variant.size.id === sizeId;

              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={isUnavailable}
                  aria-pressed={isSelected}
                  className={`min-w-12 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-150 active:scale-95 ${
                    isSelected
                      ? "border-foreground bg-foreground text-background shadow-xs"
                      : "border-border/80 bg-background text-foreground hover:bg-muted/80 hover:border-foreground/30"
                  } disabled:opacity-40 disabled:line-through disabled:pointer-events-none`}
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

        {stockText ? <p className="text-xs text-muted-foreground">{stockText}</p> : null}

        {/* Actions */}
        <div className="flex w-full flex-col gap-2.5 pt-2">
          <Button
            type="button"
            size="lg"
            className="w-full gap-2 rounded-full font-medium"
            disabled={!selected || selected.stockQuantity < 1 || mutation.isPending}
            onClick={() => {
              void addToCart();
            }}
          >
            <ShoppingBag className="size-4" />
            <span>{mutation.isPending ? copy.shop.adding : copy.shop.addToCart}</span>
          </Button>

          {message ? (
            <div
              className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
                message === copy.shop.added
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {message === copy.shop.added ? <Check className="size-4 text-emerald-600" /> : null}
              <span>{message}</span>
            </div>
          ) : null}
        </div>

        {description ? (
          <div className="border-t border-border/60 pt-5">
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

function imagesForColor(product: TProduct, colorId: string) {
  const matched = product.images.filter((image) => image.colorId === colorId);
  if (matched.length > 0) {
    return matched;
  }

  const general = product.images.filter((image) => image.colorId === null);
  return general.length > 0 ? general : product.images;
}
