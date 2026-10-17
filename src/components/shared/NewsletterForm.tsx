"use client";

import { Check, Send } from "lucide-react";
import { useSyncExternalStore, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TDictionary } from "@/lib/i18n/en";

const STORAGE_KEY = "oy-newsletter-email";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readEmail() {
  return typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
}

function saveEmail(value: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, value);
    for (const listener of listeners) {
      listener();
    }
  }
}

type TNewsletterFormProps = {
  copy: TDictionary;
};

export const NewsletterForm = ({ copy }: TNewsletterFormProps) => {
  const savedEmail = useSyncExternalStore(subscribe, readEmail, () => null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = String(data.get("email") ?? "").trim();
    if (!value.includes("@")) {
      return;
    }

    saveEmail(value);
    form.reset();
  }

  return (
    <form className="flex flex-col gap-2.5" onSubmit={onSubmit}>
      <div className="relative flex items-center">
        <label htmlFor="newsletter-email" className="sr-only">
          {copy.shop.newsletterEmail}
        </label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={copy.shop.newsletterEmail}
          className="h-11 rounded-full border-white/15 bg-white/5 pe-28 text-white placeholder:text-white/40 focus-visible:border-white/40 focus-visible:bg-white/10 focus-visible:ring-white/20"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute end-1.5 h-8 rounded-full bg-white px-4 text-xs font-medium text-black transition-all duration-150 hover:bg-white/90 active:scale-95"
        >
          <span className="flex items-center gap-1.5">
            {copy.shop.subscribe}
            <Send className="size-3" />
          </span>
        </Button>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-white/50">
        {savedEmail ? (
          <>
            <Check className="size-3.5 text-emerald-400" />
            <span className="text-emerald-300">{copy.shop.newsletterSaved}</span>
          </>
        ) : (
          copy.shop.newsletterNote
        )}
      </p>
    </form>
  );
};
