import type { Metadata } from "next";
import Link from "next/link";

import { PageFrame } from "@/components/shared/PageFrame";
import { EAppRoutes } from "@/constants/routes";
import { EProductType } from "@/constants/shop";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { EProductSort, isProductSort, sortProducts } from "@/features/catalog/lib/sort-products";
import { listProducts } from "@/server/services/catalog/catalog-service";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getDictionary(await getLocale());
  return { title: copy.shop.products };
}

type TProductsPageProps = {
  searchParams: Promise<{ type?: string; sort?: string }>;
};

export default async function ProductsPage({ searchParams }: TProductsPageProps) {
  const [params, locale] = await Promise.all([searchParams, getLocale()]);
  const copy = getDictionary(locale);
  const type =
    params.type === EProductType.tshirt || params.type === EProductType.hoodie
      ? params.type
      : undefined;
  const sort = isProductSort(params.sort) ? params.sort : EProductSort.newest;
  const products = await listProducts({ page: 1, pageSize: 100, type });
  const items = sortProducts(products.items, sort);

  return (
    <PageFrame>
      <div className="flex flex-col gap-10">
        <h1 className="text-end text-4xl font-medium">{copy.shop.products}</h1>
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex gap-5">
            <SortLink
              label={copy.shop.sortPriceDesc}
              sort={EProductSort.priceDesc}
              active={sort}
              type={type}
            />
            <SortLink
              label={copy.shop.sortPriceAsc}
              sort={EProductSort.priceAsc}
              active={sort}
              type={type}
            />
            <SortLink
              label={copy.shop.sortNewest}
              sort={EProductSort.newest}
              active={sort}
              type={type}
            />
          </div>
          <div className="flex gap-5">
            <FilterLink
              label={copy.shop.hoodie}
              type={EProductType.hoodie}
              active={type}
              sort={sort}
            />
            <FilterLink
              label={copy.shop.tshirt}
              type={EProductType.tshirt}
              active={type}
              sort={sort}
            />
            <FilterLink label={copy.shop.filterAll} type={undefined} active={type} sort={sort} />
          </div>
        </div>
        {items.length === 0 ? (
          <p className="text-end text-muted-foreground">{copy.shop.emptyProducts}</p>
        ) : (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} copy={copy} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </PageFrame>
  );
}

function catalogHref(type: string | undefined, sort: string) {
  const params = new URLSearchParams();
  if (type) {
    params.set("type", type);
  }
  if (sort !== EProductSort.newest) {
    params.set("sort", sort);
  }
  const query = params.toString();
  return query ? `${EAppRoutes.products}?${query}` : EAppRoutes.products;
}

function FilterLink({
  label,
  type,
  active,
  sort,
}: {
  label: string;
  type: string | undefined;
  active: string | undefined;
  sort: string;
}) {
  const isActive = type === active;

  return (
    <Link
      href={catalogHref(type, sort)}
      className={isActive ? "underline underline-offset-4" : "text-muted-foreground"}
    >
      {label}
    </Link>
  );
}

function SortLink({
  label,
  sort,
  active,
  type,
}: {
  label: string;
  sort: string;
  active: string;
  type: string | undefined;
}) {
  const isActive = sort === active;

  return (
    <Link
      href={catalogHref(type, sort)}
      className={isActive ? "underline underline-offset-4" : "text-muted-foreground"}
    >
      {label}
    </Link>
  );
}
