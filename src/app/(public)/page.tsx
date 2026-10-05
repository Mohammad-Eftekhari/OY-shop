import Link from "next/link";

import { EAppRoutes } from "@/constants/routes";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function HomePage() {
  const copy = getDictionary(await getLocale());

  return (
    <section className="relative flex min-h-svh items-end bg-[#171614] text-[#fffcf8]">
      <picture className="absolute inset-0">
        <source media="(min-width: 1024px)" srcSet="/banners/hero-desktop.jpg" />
        <img
          src="/banners/hero-mobile.jpg"
          alt=""
          fetchPriority="high"
          className="size-full object-cover"
        />
      </picture>
      <div className="relative z-10 flex max-w-xl flex-col items-end gap-4 px-6 pb-16 text-end md:px-16 md:pb-24">
        <p className="text-sm text-white/70">{copy.home.kicker}</p>
        <h1 className="text-4xl font-medium leading-tight whitespace-pre-line md:text-5xl">
          {copy.home.title}
        </h1>
        <p className="text-white/80">{copy.home.description}</p>
        <Link href={EAppRoutes.products} className="mt-4 underline underline-offset-4">
          {copy.home.products}
        </Link>
      </div>
    </section>
  );
}
