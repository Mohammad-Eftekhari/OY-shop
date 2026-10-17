"use client";

import { Search, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import { SignOutButton } from "@/components/shared/SignOutButton";
import { EAppRoutes } from "@/constants/routes";
import { EProductType } from "@/constants/shop";
import type { TDictionary } from "@/lib/i18n/en";

type TSiteHeaderBarProps = {
  copy: TDictionary;
  isSignedIn: boolean;
};

export const SiteHeaderBar = ({ copy, isSignedIn }: TSiteHeaderBarProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isMenuOpen = openPath === pathname;
  const menuId = useId();
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const type = pathname === EAppRoutes.products ? searchParams.get("type") : null;
  const navItems = [
    {
      href: EAppRoutes.products,
      label: copy.shop.products,
      isActive:
        pathname === EAppRoutes.products &&
        type !== EProductType.tshirt &&
        type !== EProductType.hoodie,
    },
    {
      href: `${EAppRoutes.products}?type=${EProductType.tshirt}`,
      label: copy.shop.tshirt,
      isActive: type === EProductType.tshirt,
    },
    {
      href: `${EAppRoutes.products}?type=${EProductType.hoodie}`,
      label: copy.shop.hoodie,
      isActive: type === EProductType.hoodie,
    },
  ];

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

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    searchRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isSearchOpen]);

  function toggleMenu() {
    setIsSearchOpen(false);
    setOpenPath((current) => (current === pathname ? null : pathname));
  }

  function toggleSearch() {
    setOpenPath(null);
    setIsSearchOpen((current) => !current);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    const href = value
      ? `${EAppRoutes.products}?q=${encodeURIComponent(value)}`
      : EAppRoutes.products;
    setIsSearchOpen(false);
    router.push(href);
  }

  return (
    <header className="sticky top-0 z-40 bg-background text-foreground">
      <div className="relative flex h-14 items-center justify-between gap-6 px-4 md:px-8">
        <Link href={EAppRoutes.home} className="flex items-center">
          <img src="/oy-final.svg" alt={copy.siteName} className="h-7 w-auto" />
        </Link>
        <span
          className="absolute bottom-2 start-4 h-[3px] w-12 bg-foreground md:start-8"
          aria-hidden
        />
        <nav
          aria-label={copy.shop.products}
          className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-7 lg:flex"
        >
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} isActive={item.isActive} />
          ))}
        </nav>
        <div className="flex items-center">
          <IconButton
            label={isSearchOpen ? copy.shop.closeSearch : copy.shop.search}
            pressed={isSearchOpen}
            onClick={toggleSearch}
          >
            {isSearchOpen ? (
              <X strokeWidth={1.5} className="size-5" />
            ) : (
              <Search strokeWidth={1.5} className="size-5" />
            )}
          </IconButton>
          <Link
            href={EAppRoutes.cart}
            aria-label={copy.shop.cart}
            className="flex size-8 items-center justify-center hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <ShoppingBag strokeWidth={1.5} className="size-5" />
          </Link>
          <div className="relative">
            <IconButton
              id={`${menuId}-toggle`}
              label={isMenuOpen ? copy.nav.closeMenu : copy.nav.account}
              pressed={isMenuOpen}
              controls={menuId}
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X strokeWidth={1.5} className="size-5" />
              ) : (
                <User strokeWidth={1.5} className="size-5" />
              )}
            </IconButton>
            {isMenuOpen ? (
              <nav
                id={menuId}
                aria-label={copy.nav.account}
                className="absolute end-0 z-50 mt-2 flex min-w-44 flex-col border border-border bg-background py-1 text-sm"
              >
                <AccountLink href={EAppRoutes.cart}>{copy.shop.cart}</AccountLink>
                {isSignedIn ? (
                  <>
                    <AccountLink href={EAppRoutes.orders}>{copy.shop.ordersTitle}</AccountLink>
                    <AccountLink href={EAppRoutes.addresses}>
                      {copy.shop.addressesTitle}
                    </AccountLink>
                    <AccountLink href={EAppRoutes.profile}>{copy.nav.profile}</AccountLink>
                    <SignOutButton
                      label={copy.nav.signOut}
                      className="h-auto w-full justify-start rounded-none px-3 py-2 text-sm font-normal"
                    />
                  </>
                ) : (
                  <>
                    <AccountLink href={EAppRoutes.signIn}>{copy.nav.signIn}</AccountLink>
                    <AccountLink href={EAppRoutes.signUp}>{copy.nav.signUp}</AccountLink>
                  </>
                )}
              </nav>
            ) : null}
          </div>
        </div>
        <span className="absolute end-4 bottom-2 h-[3px] w-8 bg-foreground md:end-8" aria-hidden />
      </div>
      <nav
        aria-label={copy.shop.products}
        className="flex gap-5 overflow-x-auto px-4 pb-3 lg:hidden"
      >
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} isActive={item.isActive} />
        ))}
      </nav>
      {isSearchOpen ? (
        <form
          className="flex items-center gap-3 border-t border-border px-4 py-3 md:px-8"
          onSubmit={submitSearch}
        >
          <label htmlFor={searchId} className="sr-only">
            {copy.shop.search}
          </label>
          <input
            ref={searchRef}
            id={searchId}
            value={query}
            placeholder={copy.shop.searchPlaceholder}
            className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit" className="text-sm">
            {copy.shop.search}
          </button>
        </form>
      ) : null}
    </header>
  );
};

function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`shrink-0 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground ${
        isActive ? "underline decoration-foreground underline-offset-8" : "hover:underline"
      }`}
    >
      {label}
    </Link>
  );
}

function AccountLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="px-3 py-2 text-start hover:bg-muted">
      {children}
    </Link>
  );
}

function IconButton({
  id,
  label,
  pressed,
  controls,
  onClick,
  children,
}: {
  id?: string;
  label: string;
  pressed?: boolean;
  controls?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      aria-label={label}
      aria-expanded={pressed}
      aria-controls={controls}
      className="flex size-8 items-center justify-center hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
