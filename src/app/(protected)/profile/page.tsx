import type { Metadata } from "next";

import { ProfileEditor } from "@/features/profile/components/ProfileEditor";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getDictionary(await getLocale());
  return { title: copy.profile.title };
}

export default async function ProfilePage() {
  const locale = await getLocale();
  const copy = getDictionary(locale);

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl">{copy.profile.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.profile.description}</p>
      </div>
      <ProfileEditor key={locale} copy={copy} />
    </section>
  );
}
