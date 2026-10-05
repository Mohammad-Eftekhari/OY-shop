import { SiteHeaderBar } from "@/components/shared/SiteHeaderBar";
import { getCurrentUser } from "@/lib/auth/server";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function SiteHeader() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const copy = getDictionary(locale);

  return <SiteHeaderBar copy={copy} isSignedIn={user !== null} />;
}
