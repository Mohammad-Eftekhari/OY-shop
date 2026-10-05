import type { ReactNode } from "react";

import { requireUser } from "@/lib/auth/server";

type TProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({ children }: TProtectedLayoutProps) {
  await requireUser();

  return <div className="mx-auto w-full max-w-6xl px-6 py-12 md:px-16">{children}</div>;
}
