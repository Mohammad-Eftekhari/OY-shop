import type { Metadata } from "next";
import Link from "next/link";

import { EAppRoutes } from "@/constants/routes";
import { SignUpForm } from "@/features/auth/components/SignUpForm";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getDictionary(await getLocale());
  return { title: copy.signUp.title };
}

export default async function SignUpPage() {
  const locale = await getLocale();
  const copy = getDictionary(locale);

  return (
    <section className="flex flex-col gap-6 text-start">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          New Customer
        </span>
        <h1 className="text-2xl font-normal tracking-tight md:text-3xl">{copy.signUp.title}</h1>
        <p className="text-xs text-muted-foreground">{copy.signUp.description}</p>
      </div>
      <SignUpForm key={locale} copy={copy} />
      <p className="text-center text-xs text-muted-foreground">
        {copy.signUp.prompt}{" "}
        <Link
          href={EAppRoutes.signIn}
          className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-75"
        >
          {copy.signUp.alternate}
        </Link>
      </p>
    </section>
  );
}
