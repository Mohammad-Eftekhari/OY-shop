import "server-only";

import { cookies } from "next/headers";

import { ELocale, isLocale, LOCALE_COOKIE, type TLocale } from "@/lib/locale";

export async function getLocale(): Promise<TLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : ELocale.fa;
}
