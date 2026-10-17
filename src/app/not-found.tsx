import { Compass } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EAppRoutes } from "@/constants/routes";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function NotFound() {
  const copy = getDictionary(await getLocale());

  return (
    <section className="animate-fade-in mx-auto flex w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground shadow-2xs">
        <Compass className="size-8" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          404 Error
        </span>
        <h1 className="text-3xl font-normal tracking-tight md:text-4xl">{copy.notFound.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{copy.notFound.description}</p>
      </div>
      <Button asChild size="lg" className="rounded-full font-medium">
        <Link href={EAppRoutes.home}>{copy.notFound.home}</Link>
      </Button>
    </section>
  );
}
