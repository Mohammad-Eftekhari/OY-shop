import type { Metadata } from "next";
import { Geist_Mono, Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
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
      <body className="flex min-h-full flex-col bg-background text-foreground selection:bg-foreground selection:text-background">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <AppProviders>
          <SiteHeader />
          <main className="flex w-full flex-1 flex-col">{children}</main>
          <SiteFooter copy={copy} locale={locale} isSignedIn={user !== null} />
          <Link
            href={`${EAppRoutes.home}#faq`}
            className="fixed end-5 bottom-5 z-30 inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-foreground/90 px-4.5 text-xs font-medium tracking-wide whitespace-nowrap text-background shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-foreground hover:shadow-xl active:translate-y-0 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <MessageSquare className="size-3.5" />
            <span>{copy.shop.contact}</span>
          </Link>
        </AppProviders>
      </body>
    </html>
  );
}
