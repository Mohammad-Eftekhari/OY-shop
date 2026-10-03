import { ELocale, type TLocale } from "@/lib/locale";

export function formatNumber(amount: number, locale: TLocale) {
  return new Intl.NumberFormat(locale === ELocale.fa ? "fa-IR" : "en-US").format(amount);
}

export function formatToman(amount: number, locale: TLocale) {
  const formatted = formatNumber(amount, locale);
  return locale === ELocale.fa ? `${formatted} تومان` : `${formatted} toman`;
}
