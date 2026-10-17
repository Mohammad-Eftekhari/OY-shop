import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ShopFaq } from "@/components/shared/ShopFaq";
import { EAppRoutes, productPath } from "@/constants/routes";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { ProductPhoto } from "@/features/catalog/components/ProductPhoto";
import { productTitle } from "@/features/catalog/lib/product-text";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { listProducts } from "@/server/services/catalog/catalog-service";

export default async function HomePage() {
  const locale = await getLocale();
  const copy = getDictionary(locale);
  const products = await listProducts({ page: 1, pageSize: 8 });
  const bestSellers = products.items.slice(0, 4);
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100dvh-5.5rem)] items-end overflow-hidden bg-[#111111] text-white lg:min-h-[calc(100dvh-4rem)]">
        <picture className="absolute inset-0">
          <source media="(min-width: 1024px)" srcSet="/banners/hero-desktop.jpg" />
          <img
            src="/banners/hero-mobile.jpg"
            alt=""
            fetchPriority="high"
            className="size-full object-cover transition-transform duration-1000 ease-out hover:scale-105"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

        <div className="animate-fade-in-up relative z-10 flex max-w-2xl flex-col items-start gap-4 px-4 pt-20 pb-16 text-start md:px-8 md:pb-24">
          {copy.home.kicker ? (
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur-md">
              {copy.home.kicker}
            </span>
          ) : null}
          <h1 className="text-4xl font-normal tracking-tight text-balance sm:text-5xl md:text-6xl">
            {copy.home.title}
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
            {copy.home.description}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href={EAppRoutes.products}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-medium text-black shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-xl active:translate-y-0 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span>{copy.home.products}</span>
              <ArrowIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5 text-start">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Curated Pieces
            </span>
            <h2 className="text-2xl font-normal tracking-tight md:text-3xl">
              {copy.home.bestSellers}
            </h2>
          </div>
          <Link
            href={EAppRoutes.products}
            className="group inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground/70"
          >
            <span>{copy.home.viewAll}</span>
            <ArrowIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </Link>
        </div>

        {bestSellers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.shop.emptyProducts}</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} copy={copy} locale={locale} />
            ))}
          </div>
        )}
      </section>

      {/* Everyday pieces / Studio carousel */}
      {products.items.length > 0 ? (
        <section className="border-t border-border/40 py-16 md:py-24">
          <div className="mb-8 flex items-baseline justify-between px-4 md:px-8">
            <div className="flex flex-col gap-1.5 text-start">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Studio View
              </span>
              <h2 className="text-2xl font-normal tracking-tight md:text-3xl">
                {copy.home.studio}
              </h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 md:gap-6 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.items.map((product) => {
              const title = productTitle(product, locale);
              const photo = product.images[0];
              const color = product.variants[0]?.color.hex ?? "#f3f3f3";

              return (
                <Link
                  key={product.id}
                  href={productPath(product.slug)}
                  className="group w-[72vw] shrink-0 sm:w-[42vw] lg:w-[24vw]"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted/60 shadow-2xs transition-all duration-300 group-hover:shadow-lg">
                    <ProductPhoto
                      url={photo?.url}
                      alt={title}
                      color={color}
                      className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-2.5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                    {title}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <ShopFaq copy={copy} />
    </div>
  );
}
