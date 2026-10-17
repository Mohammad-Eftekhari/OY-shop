"use client";

import { Search, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { EAppRoutes } from "@/constants/routes";
import { EProductType } from "@/constants/shop";
import type { TDictionary } from "@/lib/i18n/en";
import type { TLocale } from "@/lib/locale";

type TSiteHeaderBarProps = {
  copy: TDictionary;
  locale: TLocale;
  isSignedIn: boolean;
};

export const SiteHeaderBar = ({ copy, locale, isSignedIn }: TSiteHeaderBarProps) => {
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
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors duration-200">
      <div className="relative flex h-16 items-center justify-between gap-6 px-4 md:px-8">
        <Link
          href={EAppRoutes.home}
          className="flex items-center transition-transform duration-200 hover:scale-105 active:scale-95"
          aria-label={copy.siteName}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oy-final.svg" alt={copy.siteName} className="h-7 w-auto dark:invert" />
        </Link>

        {/* Center Navigation - Modern Segmented Control Style */}
        <nav
          aria-label={copy.shop.products}
          className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 p-1 backdrop-blur-xs lg:flex"
        >
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} isActive={item.isActive} />
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle
            label={copy.theme.toggle}
            className="size-9 rounded-full text-foreground/80 hover:bg-muted/80 hover:text-foreground"
          />

          <LanguageToggle
            copy={copy}
            locale={locale}
            className="h-8 rounded-full px-2.5 text-xs font-medium text-foreground/80 hover:bg-muted/80 hover:text-foreground"
          />

          <IconButton
            label={isSearchOpen ? copy.shop.closeSearch : copy.shop.search}
            pressed={isSearchOpen}
            onClick={toggleSearch}
          >
            {isSearchOpen ? (
              <X strokeWidth={1.75} className="size-4.5" />
            ) : (
              <Search strokeWidth={1.75} className="size-4.5" />
            )}
          </IconButton>

          <Link
            href={EAppRoutes.cart}
            aria-label={copy.shop.cart}
            className="flex size-9 items-center justify-center rounded-full text-foreground/80 transition-all duration-150 hover:bg-muted/80 hover:text-foreground active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <ShoppingBag strokeWidth={1.75} className="size-4.5" />
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
                <X strokeWidth={1.75} className="size-4.5" />
              ) : (
                <User strokeWidth={1.75} className="size-4.5" />
              )}
            </IconButton>

            {isMenuOpen ? (
              <nav
                id={menuId}
                aria-label={copy.nav.account}
                className="animate-scale-in absolute end-0 z-50 mt-2 flex min-w-48 flex-col gap-0.5 rounded-xl border border-border/80 bg-popover/95 p-1.5 text-sm shadow-lg backdrop-blur-md"
              >
                <AccountLink href={EAppRoutes.cart}>{copy.shop.cart}</AccountLink>
                {isSignedIn ? (
                  <>
                    <AccountLink href={EAppRoutes.orders}>{copy.shop.ordersTitle}</AccountLink>
                    <AccountLink href={EAppRoutes.addresses}>
                      {copy.shop.addressesTitle}
                    </AccountLink>
                    <AccountLink href={EAppRoutes.profile}>{copy.nav.profile}</AccountLink>
                    <div className="my-1 border-t border-border/50" />
                    <SignOutButton
                      label={copy.nav.signOut}
                      className="h-9 w-full justify-start rounded-lg px-3 text-sm font-normal text-destructive hover:bg-destructive/10"
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
      </div>

      {/* Mobile Category Navigation */}
      <nav
        aria-label={copy.shop.products}
        className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} isActive={item.isActive} />
        ))}
      </nav>

      {/* Expandable Search Input */}
      {isSearchOpen ? (
        <form
          className="animate-fade-in flex items-center gap-3 border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md md:px-8"
          onSubmit={submitSearch}
        >
          <label htmlFor={searchId} className="sr-only">
            {copy.shop.search}
          </label>
          <div className="relative flex flex-1 items-center">
            <Search className="absolute start-3.5 size-4 text-muted-foreground" />
            <input
              ref={searchRef}
              id={searchId}
              value={query}
              placeholder={copy.shop.searchPlaceholder}
              className="h-10 w-full rounded-full border border-border/80 bg-muted/50 ps-10 pe-4 text-sm transition-all duration-150 outline-none placeholder:text-muted-foreground focus:border-foreground focus:bg-background focus:ring-2 focus:ring-foreground/15"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-xs font-medium text-background transition-all duration-150 hover:bg-foreground/90 active:scale-95"
          >
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
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 md:text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
        isActive
          ? "bg-foreground text-background shadow-2xs"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

function AccountLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-start transition-colors hover:bg-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground"
    >
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
      className={`flex size-9 items-center justify-center rounded-full text-foreground/80 transition-all duration-150 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
        pressed ? "bg-muted text-foreground" : "hover:bg-muted/80 hover:text-foreground"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
