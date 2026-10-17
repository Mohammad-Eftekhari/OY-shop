import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

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
      <div className="animate-fade-in flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col gap-2 text-start">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Collection
          </span>
          <h1 className="text-3xl font-normal tracking-tight md:text-4xl">{copy.shop.products}</h1>
          {query ? (
            <p className="text-sm text-muted-foreground">
              {copy.shop.searchResults.replace("{query}", query)}
            </p>
          ) : null}
        </div>

        {/* Filter and Sort Bar */}
        <div className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
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

          {/* Sort Options */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground me-1">
              <SlidersHorizontal className="size-3" />
            </span>
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-base text-muted-foreground">
              {query ? copy.shop.emptySearch : copy.shop.emptyProducts}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
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
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
        isActive
          ? "bg-foreground text-background shadow-xs"
          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
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
      className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
        isActive
          ? "bg-secondary text-foreground font-semibold ring-1 ring-border"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
      }`}
    >
      {label}
    </Link>
  );
}
