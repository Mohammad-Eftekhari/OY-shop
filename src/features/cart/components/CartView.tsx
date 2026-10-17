"use client";

import { ArrowRight, ArrowLeft, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EApiRoutes, EAppRoutes, cartItemPath, productPath } from "@/constants/routes";
import { cartSchema, type TCart } from "@/features/cart/schemas/cart.schema";
import { pickLocaleText } from "@/features/catalog/lib/product-text";
import { ApiClientError, apiFetch } from "@/lib/api/client";
import type { TDictionary } from "@/lib/i18n/en";
import type { TLocale } from "@/lib/locale";
import { useFetcher, useSender } from "@/lib/query";
import { formatToman } from "@/utils/format-money";

type TCartViewProps = {
  copy: TDictionary;
  locale: TLocale;
  isSignedIn: boolean;
};

export const CartView = ({ copy, locale, isSignedIn }: TCartViewProps) => {
  const queryClient = useQueryClient();
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;
  const cart = useFetcher({
    url: EApiRoutes.cart,
    schema: cartSchema,
    enabled: isSignedIn,
  });
  const addOne = useSender<TCart, { variantId: string; quantity: number }>({
    url: EApiRoutes.cartItems,
    method: "PUT",
    schema: cartSchema,
    invalidateKeys: [[EApiRoutes.cart]],
  });
  const remove = useMutation({
    mutationFn: (variantId: string) =>
      apiFetch(cartItemPath(variantId), cartSchema, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [EApiRoutes.cart] });
    },
  });

  if (!isSignedIn) {
    return (
      <EmptyCart
        copy={copy}
        hint={copy.shop.signInToPay}
        actionHref={EAppRoutes.signIn}
        action={copy.nav.signIn}
        locale={locale}
      />
    );
  }

  if (cart.isPending) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-60 w-full rounded-2xl" />
      </div>
    );
  }

  if (cart.isError) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-border/80 bg-card p-6 text-start">
        <p className="text-sm text-destructive">{copy.shop.loadError}</p>
        <Button type="button" variant="outline" onClick={() => void cart.refetch()}>
          {copy.shop.tryAgain}
        </Button>
      </div>
    );
  }

  const items = cart.data.items;

  if (items.length === 0) {
    return (
      <EmptyCart
        copy={copy}
        hint={copy.shop.cartEmptyHint}
        actionHref={EAppRoutes.products}
        action={copy.shop.backToShop}
        locale={locale}
      />
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotalToman, 0);

  return (
    <div className="animate-fade-in grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
      {/* Items list */}
      <div className="lg:col-start-1 lg:row-start-1">
        <div className="mb-6 flex flex-col gap-1 text-start">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Review
          </span>
          <h1 className="text-3xl font-normal tracking-tight md:text-4xl">{copy.shop.cartTitle}</h1>
        </div>

        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const title = pickLocaleText(locale, item.productTitleFa, item.productTitleEn);
            const color = pickLocaleText(locale, item.colorNameFa, item.colorNameEn);

            return (
              <li
                key={item.variantId}
                className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-2xs transition-all duration-200 hover:border-border hover:shadow-xs"
              >
                <span
                  className="size-18 shrink-0 rounded-xl shadow-inner border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: item.colorHex }}
                  aria-hidden
                />
                <div className="me-auto flex flex-col items-start text-start">
                  <Link
                    href={productPath(item.productSlug)}
                    className="text-base font-medium tracking-tight hover:underline"
                  >
                    {title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {color} · {item.sizeCode} · {item.quantity}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-all duration-150 hover:bg-muted active:scale-95"
                      onClick={() => addOne.mutate({ variantId: item.variantId, quantity: 1 })}
                    >
                      <Plus className="size-3" />
                      <span>{copy.shop.addOne}</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive active:scale-95"
                      onClick={() => remove.mutate(item.variantId)}
                    >
                      <Trash2 className="size-3" />
                      <span>{copy.shop.remove}</span>
                    </button>
                  </div>
                  {addOne.error instanceof ApiClientError &&
                  addOne.variables?.variantId === item.variantId ? (
                    <p className="mt-1.5 text-xs text-destructive">{copy.shop.notEnoughStock}</p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-semibold">
                    {formatToman(item.lineTotalToman, locale)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Order summary sidebar */}
      <aside className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
        <h2 className="text-start text-base font-semibold tracking-tight">{copy.shop.summary}</h2>
        <div className="flex flex-col gap-2 border-b border-border/60 pb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{copy.shop.subtotal}</span>
            <span className="font-medium">{formatToman(subtotal, locale)}</span>
          </div>
          <p className="text-start text-xs text-muted-foreground">{copy.shop.shippingLater}</p>
        </div>
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-sm font-semibold">{copy.shop.total}</span>
          <span className="text-2xl font-medium tracking-tight">
            {formatToman(subtotal, locale)}
          </span>
        </div>
        <Button asChild size="lg" className="w-full gap-2 rounded-full font-medium">
          <Link href={EAppRoutes.checkout}>
            <span>{copy.shop.checkout}</span>
            <ArrowIcon className="size-4" />
          </Link>
        </Button>
      </aside>
    </div>
  );
};

const EmptyCart = ({
  copy,
  hint,
  actionHref,
  action,
  locale,
}: {
  copy: TDictionary;
  hint: string;
  actionHref: string;
  action: string;
  locale: TLocale;
}) => {
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center gap-5 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
        <ShoppingBag className="size-8" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-normal tracking-tight md:text-3xl">{copy.shop.cartEmpty}</h1>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
      <Button asChild size="lg" className="gap-2 rounded-full font-medium">
        <Link href={actionHref}>
          <span>{action}</span>
          <ArrowIcon className="size-4" />
        </Link>
      </Button>
    </div>
  );
};
