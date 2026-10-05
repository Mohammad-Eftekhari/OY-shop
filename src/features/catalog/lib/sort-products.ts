import type { TProduct } from "@/features/catalog/schemas/catalog.schema";

export const EProductSort = {
  newest: "newest",
  priceAsc: "price-asc",
  priceDesc: "price-desc",
} as const;

export type TProductSort = (typeof EProductSort)[keyof typeof EProductSort];

export function isProductSort(value: string | undefined): value is TProductSort {
  return (
    value === EProductSort.newest ||
    value === EProductSort.priceAsc ||
    value === EProductSort.priceDesc
  );
}

export function sortProducts(products: TProduct[], sort: TProductSort) {
  if (sort === EProductSort.newest) {
    return products;
  }

  const direction = sort === EProductSort.priceAsc ? 1 : -1;
  return [...products].sort((left, right) => (left.priceToman - right.priceToman) * direction);
}
