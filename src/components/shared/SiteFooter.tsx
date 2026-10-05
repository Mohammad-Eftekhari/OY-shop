import type { TDictionary } from "@/lib/i18n/en";

type TSiteFooterProps = {
  copy: TDictionary;
};

export const SiteFooter = ({ copy }: TSiteFooterProps) => {
  return (
    <footer className="mt-auto flex items-center justify-between gap-6 border-t px-6 py-7 text-sm text-muted-foreground md:px-16">
      <span className="font-[family-name:var(--font-geist-sans)] text-base text-foreground">
        OY
      </span>
      <p>{copy.shop.footerNote}</p>
    </footer>
  );
};
