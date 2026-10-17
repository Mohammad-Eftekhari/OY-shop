import { ChevronDown } from "lucide-react";

import type { TDictionary } from "@/lib/i18n/en";

type TShopFaqProps = {
  copy: TDictionary;
};

export const ShopFaq = ({ copy }: TShopFaqProps) => {
  const items = [
    [copy.home.faqShippingQuestion, copy.home.faqShippingAnswer],
    [copy.home.faqReturnQuestion, copy.home.faqReturnAnswer],
    [copy.home.faqPickupQuestion, copy.home.faqPickupAnswer],
  ];

  return (
    <section
      id="faq"
      className="scroll-mt-28 grid gap-10 px-4 py-16 md:grid-cols-[minmax(14rem,0.8fr)_minmax(0,1.6fr)] md:px-8 md:py-24"
    >
      <div className="flex flex-col items-start gap-3 text-start">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Help & Support
        </span>
        <h2 className="text-3xl font-normal tracking-tight md:text-4xl">{copy.home.faqTitle}</h2>
      </div>

      <div className="flex flex-col divide-y divide-border/60 rounded-2xl border border-border/80 bg-card/60 p-2 shadow-2xs backdrop-blur-xs">
        {items.map(([question, answer]) => (
          <details key={question} className="group px-4 py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-start text-sm font-medium transition-colors hover:text-foreground/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden">
              <span>{question}</span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-transform duration-200 group-open:rotate-180 group-open:bg-foreground group-open:text-background motion-reduce:transition-none">
                <ChevronDown className="size-3.5" aria-hidden />
              </span>
            </summary>
            <p className="max-w-prose pb-4 text-start text-sm leading-relaxed text-muted-foreground">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
};
