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

  return (
    <div>
      <section className="relative flex h-[calc(100dvh-5.5rem)] items-end bg-[#111111] text-white lg:h-[calc(100dvh-3.5rem)]">
        <picture className="absolute inset-0">
          <source media="(min-width: 1024px)" srcSet="/banners/hero-desktop.jpg" />
          <img
            src="/banners/hero-mobile.jpg"
            alt=""
            fetchPriority="high"
            className="size-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="relative z-10 flex max-w-xl flex-col items-start gap-3 px-4 pt-16 pb-16 pe-36 text-start md:px-8 md:pb-20">
          <h1 className="text-3xl leading-tight md:text-5xl">{copy.home.title}</h1>
          <p className="max-w-md text-sm leading-6 text-white/85">{copy.home.description}</p>
          <Link
            href={EAppRoutes.products}
            className="mt-3 inline-flex h-11 items-center bg-white px-5 text-sm text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {copy.home.products}
          </Link>
        </div>
      </section>
      <section className="px-4 py-14 md:px-8 md:py-16">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl md:text-3xl">{copy.home.bestSellers}</h2>
          <Link href={EAppRoutes.products} className="text-sm hover:underline">
            {copy.home.viewAll}
          </Link>
        </div>
        {bestSellers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.shop.emptyProducts}</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-1 gap-y-10 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} copy={copy} locale={locale} />
            ))}
          </div>
        )}
      </section>
      {products.items.length > 0 ? (
        <section className="pb-14 md:pb-16">
          <h2 className="mb-6 px-4 text-2xl md:px-8 md:text-3xl">{copy.home.studio}</h2>
          <div className="flex gap-1 overflow-x-auto px-4 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.items.map((product) => {
              const title = productTitle(product, locale);
              const photo = product.images[0];
              const color = product.variants[0]?.color.hex ?? "#f3f3f3";

              return (
                <Link
                  key={product.id}
                  href={productPath(product.slug)}
                  className="w-[72vw] shrink-0 sm:w-[42vw] lg:w-[24vw]"
                >
                  <ProductPhoto
                    url={photo?.url}
                    alt={title}
                    color={color}
                    className="aspect-[3/4] w-full object-cover"
                  />
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
