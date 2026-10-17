import Link from "next/link";
import type { ReactNode } from "react";

import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { SignOutButton } from "@/components/shared/SignOutButton";
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
    <footer className="mt-auto bg-footer text-foreground">
      <div className="grid gap-12 px-4 py-14 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm">{copy.shop.newsletterTitle}</h2>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            {copy.shop.newsletterBody}
          </p>
          <NewsletterForm copy={copy} />
        </div>
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
                className="h-auto justify-start px-0 text-sm font-normal text-foreground hover:bg-transparent hover:underline"
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
          <p className="text-sm text-muted-foreground">{copy.shop.footerNote}</p>
        </FooterColumn>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 bg-background px-4 py-5 pe-40 md:px-8">
        <LanguageToggle copy={copy} locale={locale} className="h-auto px-0 text-sm font-normal" />
        <p className="text-xs text-muted-foreground">
          © {year} {copy.siteName}
        </p>
      </div>
    </footer>
  );
};

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm">{title}</h2>
      <div className="flex flex-col items-start gap-2 text-sm">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      {children}
    </Link>
  );
}
