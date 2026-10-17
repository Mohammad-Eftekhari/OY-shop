"use client";

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
  return window.localStorage.getItem(STORAGE_KEY);
}

function saveEmail(value: string) {
  window.localStorage.setItem(STORAGE_KEY, value);
  for (const listener of listeners) {
    listener();
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
    <form className="flex flex-col gap-2" onSubmit={onSubmit}>
      <div className="flex">
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
          className="bg-background"
        />
        <Button
          type="submit"
          className="h-11 shrink-0 bg-subscribe px-5 text-white hover:bg-subscribe/90"
        >
          {copy.shop.subscribe}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {savedEmail ? copy.shop.newsletterSaved : copy.shop.newsletterNote}
      </p>
    </form>
  );
};
