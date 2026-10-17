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
      className="scroll-mt-28 grid gap-8 p-4 md:grid-cols-[minmax(12rem,0.8fr)_minmax(0,1.6fr)] md:p-8"
    >
      <h2 className="text-3xl md:text-4xl">{copy.home.faqTitle}</h2>
      <div className="border-t border-border">
        {items.map(([question, answer]) => (
          <details key={question} className="group border-b border-border">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden">
              {question}
              <ChevronDown
                className="size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                aria-hidden
              />
            </summary>
            <p className="max-w-prose pb-4 text-sm leading-6 text-muted-foreground">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
};
