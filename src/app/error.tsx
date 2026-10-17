"use client";

import { AlertTriangle } from "lucide-react";
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
    <section className="animate-fade-in mx-auto flex w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shadow-2xs">
        <AlertTriangle className="size-8" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-wider text-destructive uppercase">
          Application Error
        </span>
        <h1 className="text-3xl font-normal tracking-tight md:text-4xl">{copy.appError.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{copy.appError.description}</p>
      </div>
      <Button type="button" size="lg" className="rounded-full font-medium" onClick={reset}>
        {copy.appError.tryAgain}
      </Button>
    </section>
  );
}
