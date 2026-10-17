import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, MapPin, Package, User } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EAppRoutes } from "@/constants/routes";
import { requireUser } from "@/lib/auth/server";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getDictionary(await getLocale());
  return { title: copy.dashboard.title };
}

export default async function DashboardPage() {
  const [session, locale] = await Promise.all([requireUser(), getLocale()]);
  const copy = getDictionary(locale);
  const ArrowIcon = locale === "fa" ? ArrowLeft : ArrowRight;

  const quickLinks = [
    {
      title: copy.shop.ordersTitle,
      description: copy.shop.ordersTitle,
      href: EAppRoutes.orders,
      icon: Package,
    },
    {
      title: copy.shop.addressesTitle,
      description: copy.shop.oneDefault,
      href: EAppRoutes.addresses,
      icon: MapPin,
    },
    {
      title: copy.profile.title,
      description: copy.profile.description,
      href: EAppRoutes.profile,
      icon: User,
    },
  ];

  return (
    <section className="animate-fade-in flex max-w-4xl flex-col items-start gap-8 text-start">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Welcome back
        </span>
        <h1 className="text-3xl font-normal tracking-tight md:text-4xl">
          {session.user.name || copy.dashboard.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {copy.dashboard.signedInAs}{" "}
          <span className="font-medium text-foreground">{session.user.email}</span>
        </p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col justify-between gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-xs active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Icon className="size-5" />
                </span>
                <ArrowIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold text-base tracking-tight group-hover:underline">
                  {item.title}
                </h2>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="pt-2">
        <Button asChild variant="outline" className="rounded-full">
          <Link href={EAppRoutes.profile}>{copy.dashboard.editProfile}</Link>
        </Button>
      </div>
    </section>
  );
}
