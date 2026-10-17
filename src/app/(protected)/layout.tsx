import type { ReactNode } from "react";

import { requireUser } from "@/lib/auth/server";

type TProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({ children }: TProtectedLayoutProps) {
  await requireUser();

  return <div className="w-full px-4 py-10 md:px-8 md:py-14">{children}</div>;
}
