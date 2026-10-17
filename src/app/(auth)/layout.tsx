import type { ReactNode } from "react";

import { requireAnonymous } from "@/lib/auth/server";

type TAuthLayoutProps = {
  children: ReactNode;
};

export default async function AuthLayout({ children }: TAuthLayoutProps) {
  await requireAnonymous();

  return (
    <div className="animate-fade-in flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card/95 p-8 shadow-xs backdrop-blur-sm sm:p-10">
        {children}
      </div>
    </div>
  );
}
