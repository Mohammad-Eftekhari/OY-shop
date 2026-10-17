import type { Metadata } from "next";
import { Geist_Mono, Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppProviders } from "@/components/shared/AppProviders";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { EAppRoutes } from "@/constants/routes";
import { getCurrentUser } from "@/lib/auth/server";
import { getLocale } from "@/lib/get-locale";
import { directionForLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { themeInitScript } from "@/lib/theme-script";

import { vazirmatn } from "./fonts";
import "./globals.css";

const grotesk = Schibsted_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const copy = getDictionary(await getLocale());

  return {
    title: {
      default: copy.siteName,
      template: `%s · ${copy.siteName}`,
    },
    description: copy.siteDescription,
    icons: {
      icon: "/oy-final.svg",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

type TRootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: TRootLayoutProps) {
  const [locale, user] = await Promise.all([getLocale(), getCurrentUser()]);
  const copy = getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={directionForLocale(locale)}
      suppressHydrationWarning
      className={`${vazirmatn.variable} ${grotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <AppProviders>
          <SiteHeader />
          <main className="flex w-full flex-1 flex-col">{children}</main>
          <SiteFooter copy={copy} locale={locale} isSignedIn={user !== null} />
          <Link
            href={`${EAppRoutes.home}#faq`}
            className="fixed end-4 bottom-4 z-30 inline-flex h-10 items-center rounded-full bg-foreground px-4 text-sm whitespace-nowrap text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {copy.shop.contact}
          </Link>
        </AppProviders>
      </body>
    </html>
  );
}
