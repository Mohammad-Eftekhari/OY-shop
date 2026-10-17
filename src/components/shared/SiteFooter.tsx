import Link from "next/link";
import type { ReactNode } from "react";

import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { EAppRoutes } from "@/constants/routes";
import { EProductType } from "@/constants/shop";
import type { TDictionary } from "@/lib/i18n/en";
import type { TLocale } from "@/lib/locale";

type TSiteFooterProps = {
  copy: TDictionary;
  locale: TLocale;
  isSignedIn: boolean;
};

export const SiteFooter = ({ copy, locale, isSignedIn }: TSiteFooterProps) => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/40 bg-footer text-footer-foreground">
      <div className="grid gap-12 px-4 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-4 lg:col-span-5 lg:pe-12">
          <Link
            href={EAppRoutes.home}
            className="flex items-center gap-2"
            aria-label={copy.siteName}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/oy-final.svg" alt={copy.siteName} className="h-6 w-auto invert" />
          </Link>
          <p className="max-w-sm text-sm leading-6 text-white/60">{copy.siteDescription}</p>
          <div className="mt-2 flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-wider text-white/40 uppercase">
              {copy.shop.newsletterTitle}
            </h2>
            <NewsletterForm copy={copy} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
          <FooterColumn title={copy.shop.footerShop}>
            <FooterLink href={EAppRoutes.products}>{copy.shop.products}</FooterLink>
            <FooterLink href={`${EAppRoutes.products}?type=${EProductType.tshirt}`}>
              {copy.shop.tshirt}
            </FooterLink>
            <FooterLink href={`${EAppRoutes.products}?type=${EProductType.hoodie}`}>
              {copy.shop.hoodie}
            </FooterLink>
            <FooterLink href={EAppRoutes.cart}>{copy.shop.cart}</FooterLink>
          </FooterColumn>

          <FooterColumn title={copy.shop.footerAccount}>
            {isSignedIn ? (
              <>
                <FooterLink href={EAppRoutes.orders}>{copy.shop.ordersTitle}</FooterLink>
                <FooterLink href={EAppRoutes.addresses}>{copy.shop.addressesTitle}</FooterLink>
                <FooterLink href={EAppRoutes.profile}>{copy.nav.profile}</FooterLink>
                <SignOutButton
                  label={copy.nav.signOut}
                  className="h-auto justify-start px-0 text-sm font-normal text-white/70 hover:bg-transparent hover:text-white"
                />
              </>
            ) : (
              <>
                <FooterLink href={EAppRoutes.signIn}>{copy.nav.signIn}</FooterLink>
                <FooterLink href={EAppRoutes.signUp}>{copy.nav.signUp}</FooterLink>
              </>
            )}
          </FooterColumn>

          <FooterColumn title={copy.shop.footerInfo}>
            <FooterLink href={`${EAppRoutes.home}#faq`}>{copy.home.faqTitle}</FooterLink>
            <p className="text-sm leading-relaxed text-white/50">{copy.shop.footerNote}</p>
          </FooterColumn>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-black/30 px-4 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <LanguageToggle
            copy={copy}
            locale={locale}
            className="h-8 rounded-full border border-white/10 px-3 text-xs text-white/70 hover:bg-white/10 hover:text-white"
          />
          <ThemeToggle
            label={copy.theme.toggle}
            className="size-8 rounded-full border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
          />
        </div>
        <p className="text-xs text-white/40">
          © {year} {copy.siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3.5">
      <h2 className="text-xs font-semibold tracking-wider text-white/40 uppercase">{title}</h2>
      <div className="flex flex-col items-start gap-2.5 text-sm">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="text-white/70 transition-all duration-150 hover:translate-x-0.5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {children}
    </Link>
  );
}
