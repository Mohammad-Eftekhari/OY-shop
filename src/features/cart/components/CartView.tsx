"use client";

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
      />
    );
  }

  if (cart.isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (cart.isError) {
    return (
      <div className="flex flex-col items-end gap-3 text-end">
        <p>{copy.shop.loadError}</p>
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
      />
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotalToman, 0);

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <aside className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1">
        <p className="text-sm text-muted-foreground">{copy.shop.subtotal}</p>
        <p className="text-3xl font-medium">{formatToman(subtotal, locale)}</p>
        <p className="text-sm text-muted-foreground">{copy.shop.shippingLater}</p>
        <Button asChild className="h-12 rounded-sm">
          <Link href={EAppRoutes.checkout}>{copy.shop.checkout}</Link>
        </Button>
      </aside>
      <div className="lg:col-start-1 lg:row-start-1">
        <h1 className="mb-6 text-end text-4xl font-medium">{copy.shop.cartTitle}</h1>
        <ul>
          {items.map((item) => {
            const title = pickLocaleText(locale, item.productTitleFa, item.productTitleEn);
            const color = pickLocaleText(locale, item.colorNameFa, item.colorNameEn);

            return (
              <li key={item.variantId} className="flex items-center gap-4 border-b py-5">
                <span
                  className="size-20 shrink-0"
                  style={{ backgroundColor: item.colorHex }}
                  aria-hidden
                />
                <div className="me-auto text-end">
                  <Link href={productPath(item.productSlug)} className="text-lg font-medium">
                    {title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {color} · {item.sizeCode} · {item.quantity}
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-sm underline-offset-4 hover:underline"
                    onClick={() => addOne.mutate({ variantId: item.variantId, quantity: 1 })}
                  >
                    {copy.shop.addOne}
                  </button>
                  {addOne.error instanceof ApiClientError &&
                  addOne.variables?.variantId === item.variantId ? (
                    <p className="text-sm text-destructive">{copy.shop.notEnoughStock}</p>
                  ) : null}
                </div>
                <div className="flex flex-col items-start gap-2">
                  <p>{formatToman(item.lineTotalToman, locale)}</p>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                    onClick={() => remove.mutate(item.variantId)}
                  >
                    {copy.shop.remove}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const EmptyCart = ({
  copy,
  hint,
  actionHref,
  action,
}: {
  copy: TDictionary;
  hint: string;
  actionHref: string;
  action: string;
}) => {
  return (
    <div className="flex flex-col items-end gap-4 py-16 text-end">
      <h1 className="text-4xl font-medium">{copy.shop.cartEmpty}</h1>
      <p className="text-muted-foreground">{hint}</p>
      <Button asChild variant="outline" className="rounded-sm">
        <Link href={actionHref}>{action}</Link>
      </Button>
    </div>
  );
};
