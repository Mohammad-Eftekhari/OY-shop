"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { SignOutButton } from "@/components/shared/SignOutButton";
import { Button } from "@/components/ui/button";
import { EAppRoutes } from "@/constants/routes";
import type { TDictionary } from "@/lib/i18n/en";

type TSiteHeaderBarProps = {
  copy: TDictionary;
  isSignedIn: boolean;
};

export const SiteHeaderBar = ({ copy, isSignedIn }: TSiteHeaderBarProps) => {
  const pathname = usePathname();
  const isHome = pathname === EAppRoutes.home;
  const [openPath, setOpenPath] = useState<string | null>(null);
  const isMenuOpen = openPath === pathname;
  const menuId = useId();
  const tone = isHome ? "text-white hover:bg-white/10 hover:text-white" : undefined;

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function closeOnPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      const menu = document.getElementById(menuId);
      const toggle = document.getElementById(`${menuId}-toggle`);
      if (menu?.contains(target) || toggle?.contains(target)) {
        return;
      }

      setOpenPath(null);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenPath(null);
      }
    }

    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen, menuId]);

  function toggleMenu() {
    setOpenPath((current) => (current === pathname ? null : pathname));
  }

  return (
    <header
      className={
        isHome
          ? "absolute inset-x-0 top-0 z-20 text-white"
          : "border-b border-border bg-background text-foreground"
      }
    >
      <div className="flex items-center justify-between gap-6 px-6 py-5 md:px-16">
        <Link
          href={EAppRoutes.home}
          className="font-[family-name:var(--font-geist-sans)] text-xl tracking-wide"
        >
          OY
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href={EAppRoutes.products}
            className="px-2 py-1 text-sm underline-offset-4 hover:underline"
          >
            {copy.shop.products}
          </Link>
          <div className="relative">
            <Button
              id={`${menuId}-toggle`}
              type="button"
              variant="ghost"
              size="icon"
              className={tone}
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              aria-label={isMenuOpen ? copy.nav.closeMenu : copy.nav.menu}
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
            {isMenuOpen ? (
              <nav
                id={menuId}
                aria-label={copy.nav.account}
                className="absolute end-0 z-30 mt-2 flex min-w-44 flex-col border border-border bg-background p-2 text-sm text-foreground"
              >
                <Link href={EAppRoutes.cart} className="px-3 py-2 text-end hover:underline">
                  {copy.shop.cart}
                </Link>
                {isSignedIn ? (
                  <>
                    <Link href={EAppRoutes.orders} className="px-3 py-2 text-end hover:underline">
                      {copy.shop.ordersTitle}
                    </Link>
                    <Link
                      href={EAppRoutes.addresses}
                      className="px-3 py-2 text-end hover:underline"
                    >
                      {copy.shop.addressesTitle}
                    </Link>
                    <SignOutButton
                      label={copy.nav.signOut}
                      className="h-auto w-full justify-end rounded-sm px-3 py-2 font-normal"
                    />
                  </>
                ) : (
                  <Link href={EAppRoutes.signIn} className="px-3 py-2 text-end hover:underline">
                    {copy.nav.signIn}
                  </Link>
                )}
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
