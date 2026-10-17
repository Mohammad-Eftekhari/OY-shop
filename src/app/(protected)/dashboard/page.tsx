import type { Metadata } from "next";
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

  return (
    <section className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-3xl">{copy.dashboard.title}</h1>
      <p>
        {copy.dashboard.signedInAs} <span className="font-medium">{session.user.name}</span> (
        {session.user.email}).
      </p>
      <div>
        <Button asChild>
          <Link href={EAppRoutes.profile}>{copy.dashboard.editProfile}</Link>
        </Button>
      </div>
    </section>
  );
}
