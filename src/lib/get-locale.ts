import "server-only";

import { ELocale, type TLocale } from "@/lib/locale";

export async function getLocale(): Promise<TLocale> {
  return ELocale.fa;
}
