import type { Metadata } from "next";
import Link from "next/link";

import { EAppRoutes } from "@/constants/routes";
import { SignInForm } from "@/features/auth/components/SignInForm";
import { getLocale } from "@/lib/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getDictionary(await getLocale());
  return { title: copy.signIn.title };
}

type TSignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: TSignInPageProps) {
  const [params, locale] = await Promise.all([searchParams, getLocale()]);
  const copy = getDictionary(locale);
  const nextPath = typeof params.next === "string" ? params.next : null;

  return (
    <section className="flex flex-col gap-6 text-start">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Account
        </span>
        <h1 className="text-2xl font-normal tracking-tight md:text-3xl">{copy.signIn.title}</h1>
        <p className="text-xs text-muted-foreground">{copy.signIn.description}</p>
      </div>
      <SignInForm key={locale} copy={copy} nextPath={nextPath} />
      <p className="text-center text-xs text-muted-foreground">
        {copy.signIn.prompt}{" "}
        <Link
          href={EAppRoutes.signUp}
          className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-75"
        >
          {copy.signIn.alternate}
        </Link>
      </p>
    </section>
  );
}
