import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EAppRoutes } from "@/constants/routes";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function NotFound() {
  const copy = getDictionary(await getLocale());

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">{copy.notFound.title}</h1>
      <p className="text-muted-foreground">{copy.notFound.description}</p>
      <div>
        <Button asChild>
          <Link href={EAppRoutes.home}>{copy.notFound.home}</Link>
        </Button>
      </div>
    </section>
  );
}
