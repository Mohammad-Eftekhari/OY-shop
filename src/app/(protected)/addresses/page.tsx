import type { Metadata } from "next";

import { AddressBook } from "@/features/address/components/AddressBook";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getDictionary(await getLocale());
  return { title: copy.shop.addressesTitle };
}

export default async function AddressesPage() {
  const copy = getDictionary(await getLocale());
  return <AddressBook copy={copy} />;
}
