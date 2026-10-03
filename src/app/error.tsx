"use client";

import { useEffect, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ELocale, isLocale, LOCALE_COOKIE, type TLocale } from "@/lib/locale";

type TErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

function readLocale(): TLocale {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match?.[1] ? decodeURIComponent(match[1]) : undefined;
  return isLocale(value) ? value : ELocale.en;
}

export default function ErrorPage({ error, reset }: TErrorPageProps) {
  const locale = useSyncExternalStore(
    () => () => {},
    readLocale,
    () => ELocale.en,
  );
  const copy = getDictionary(locale);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">{copy.appError.title}</h1>
      <p className="text-muted-foreground">{copy.appError.description}</p>
      <div>
        <Button type="button" onClick={reset}>
          {copy.appError.tryAgain}
        </Button>
      </div>
    </section>
  );
}
