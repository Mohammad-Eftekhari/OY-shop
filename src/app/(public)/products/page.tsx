import type { Metadata } from "next";
import Link from "next/link";

import { PageFrame } from "@/components/shared/PageFrame";
import { EAppRoutes } from "@/constants/routes";
import { EProductType } from "@/constants/shop";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { EProductSort, isProductSort, sortProducts } from "@/features/catalog/lib/sort-products";
import { productTitle } from "@/features/catalog/lib/product-text";
import { listProducts } from "@/server/services/catalog/catalog-service";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getDictionary(await getLocale());
  return { title: copy.shop.products };
}

type TProductsPageProps = {
  searchParams: Promise<{ type?: string; sort?: string; q?: string }>;
};

export default async function ProductsPage({ searchParams }: TProductsPageProps) {
  const [params, locale] = await Promise.all([searchParams, getLocale()]);
  const copy = getDictionary(locale);
  const type =
    params.type === EProductType.tshirt || params.type === EProductType.hoodie
      ? params.type
      : undefined;
  const sort = isProductSort(params.sort) ? params.sort : EProductSort.newest;
  const query = params.q?.trim() ?? "";
  const products = await listProducts({ page: 1, pageSize: 100, type });
  const sorted = sortProducts(products.items, sort);
  const items = query
    ? sorted.filter((product) => {
        const haystack = `${product.titleEn} ${product.titleFa} ${productTitle(product, locale)}`;
        return haystack.toLocaleLowerCase().includes(query.toLocaleLowerCase());
      })
    : sorted;

  return (
    <PageFrame>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-start text-3xl md:text-4xl">{copy.shop.products}</h1>
          {query ? (
            <p className="text-sm text-muted-foreground">
              {copy.shop.searchResults.replace("{query}", query)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex gap-5">
            <FilterLink
              label={copy.shop.filterAll}
              type={undefined}
              active={type}
              sort={sort}
              query={query}
            />
            <FilterLink
              label={copy.shop.tshirt}
              type={EProductType.tshirt}
              active={type}
              sort={sort}
              query={query}
            />
            <FilterLink
              label={copy.shop.hoodie}
              type={EProductType.hoodie}
              active={type}
              sort={sort}
              query={query}
            />
          </div>
          <div className="flex gap-5">
            <SortLink
              label={copy.shop.sortNewest}
              sort={EProductSort.newest}
              active={sort}
              type={type}
              query={query}
            />
            <SortLink
              label={copy.shop.sortPriceAsc}
              sort={EProductSort.priceAsc}
              active={sort}
              type={type}
              query={query}
            />
            <SortLink
              label={copy.shop.sortPriceDesc}
              sort={EProductSort.priceDesc}
              active={sort}
              type={type}
              query={query}
            />
          </div>
        </div>
        {items.length === 0 ? (
          <p className="text-start text-sm text-muted-foreground">
            {query ? copy.shop.emptySearch : copy.shop.emptyProducts}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-1 gap-y-10 lg:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} copy={copy} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </PageFrame>
  );
}

function catalogHref(type: string | undefined, sort: string, query: string) {
  const params = new URLSearchParams();
  if (type) {
    params.set("type", type);
  }
  if (sort !== EProductSort.newest) {
    params.set("sort", sort);
  }
  if (query) {
    params.set("q", query);
  }
  const search = params.toString();
  return search ? `${EAppRoutes.products}?${search}` : EAppRoutes.products;
}

function FilterLink({
  label,
  type,
  active,
  sort,
  query,
}: {
  label: string;
  type: string | undefined;
  active: string | undefined;
  sort: string;
  query: string;
}) {
  const isActive = type === active;

  return (
    <Link
      href={catalogHref(type, sort, query)}
      aria-current={isActive ? "page" : undefined}
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
  query,
}: {
  label: string;
  sort: string;
  active: string;
  type: string | undefined;
  query: string;
}) {
  const isActive = sort === active;

  return (
    <Link
      href={catalogHref(type, sort, query)}
      aria-current={isActive ? "page" : undefined}
      className={isActive ? "underline underline-offset-4" : "text-muted-foreground"}
    >
      {label}
    </Link>
  );
}
