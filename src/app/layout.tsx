import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { AppProviders } from "@/components/shared/AppProviders";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { getLocale } from "@/lib/get-locale";
import { directionForLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { themeInitScript } from "@/lib/theme-script";

import { vazirmatn } from "./fonts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
  const locale = await getLocale();
  const copy = getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={directionForLocale(locale)}
      suppressHydrationWarning
      className={`${vazirmatn.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <AppProviders>
          <SiteHeader />
          <main className="flex w-full flex-1 flex-col">{children}</main>
          <SiteFooter copy={copy} />
        </AppProviders>
      </body>
    </html>
  );
}
