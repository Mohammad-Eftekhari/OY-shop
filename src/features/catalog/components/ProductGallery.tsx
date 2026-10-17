"use client";

import { cn } from "cn";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductPhoto } from "@/features/catalog/components/ProductPhoto";
import type { TProduct } from "@/features/catalog/schemas/catalog.schema";
import type { TDictionary } from "@/lib/i18n/en";
import type { TLocale } from "@/lib/locale";

type TProductImage = TProduct["images"][number];

type TProductGalleryProps = {
  images: TProductImage[];
  title: string;
  color: string;
  copy: TDictionary;
  locale: TLocale;
};

const dragThreshold = 8;

export const ProductGallery = ({ images, title, color, copy, locale }: TProductGalleryProps) => {
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const openedAtRef = useRef(0);
  const dragRef = useRef({ x: 0, moved: false });
  const PreviousIcon = locale === "fa" ? ChevronRight : ChevronLeft;
  const NextIcon = locale === "fa" ? ChevronLeft : ChevronRight;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const child = lightboxRef.current?.children[openedAtRef.current] as HTMLElement | undefined;
      child?.scrollIntoView({ inline: "center", block: "nearest" });
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted/60">
        <ProductPhoto alt={title} color={color} className="size-full object-cover" />
      </div>
    );
  }

  function goTo(nextIndex: number, scroller: HTMLDivElement | null) {
    const bounded = Math.min(Math.max(nextIndex, 0), images.length - 1);
    setIndex(bounded);
    const child = scroller?.children[bounded] as HTMLElement | undefined;
    child?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }

  function syncIndex(scroller: HTMLDivElement) {
    const next = indexFromScroll(scroller);
    setIndex((current) => (current === next ? current : next));
  }

  function openAt(nextIndex: number) {
    if (dragRef.current.moved) {
      return;
    }

    openedAtRef.current = nextIndex;
    setIndex(nextIndex);
    setIsOpen(true);
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) {
      return;
    }

    const child = scrollerRef.current?.children[index] as HTMLElement | undefined;
    child?.scrollIntoView({ inline: "center", block: "nearest" });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl bg-muted/60 shadow-xs">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => syncIndex(event.currentTarget)}
        >
          {images.map((image, imageIndex) => (
            <button
              key={image.id}
              type="button"
              className="group/photo w-full shrink-0 snap-center focus:outline-none"
              aria-label={copy.shop.openImage}
              onPointerDown={(event) => {
                dragRef.current = { x: event.clientX, moved: false };
              }}
              onPointerMove={(event) => {
                if (Math.abs(event.clientX - dragRef.current.x) > dragThreshold) {
                  dragRef.current.moved = true;
                }
              }}
              onClick={() => openAt(imageIndex)}
            >
              <ProductPhoto
                url={image.url}
                alt={imageAlt(image, title, locale)}
                color={color}
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover/photo:scale-105"
              />
            </button>
          ))}
        </div>
        {images.length > 1 ? (
          <>
            <GalleryStep
              label={copy.shop.previousImage}
              disabled={index === 0}
              className="start-3.5"
              onClick={() => goTo(index - 1, scrollerRef.current)}
            >
              <PreviousIcon className="size-4" />
            </GalleryStep>
            <GalleryStep
              label={copy.shop.nextImage}
              disabled={index === images.length - 1}
              className="end-3.5"
              onClick={() => goTo(index + 1, scrollerRef.current)}
            >
              <NextIcon className="size-4" />
            </GalleryStep>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <GalleryThumbs
          images={images}
          index={index}
          title={title}
          color={color}
          locale={locale}
          onSelect={(imageIndex) => goTo(imageIndex, scrollerRef.current)}
        />
      ) : null}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="!inset-0 !top-0 !left-0 !h-dvh !w-screen !max-w-none !translate-x-0 !translate-y-0 gap-0 !rounded-none !border-0 !bg-black/95 !p-0 text-white !ring-0 !animate-none sm:!max-w-none backdrop-blur-xl"
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogClose className="absolute top-4 end-4 z-20 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95 hover:bg-white/20">
            <X className="size-5" />
            <span className="sr-only">{copy.shop.closeImage}</span>
          </DialogClose>
          <div
            ref={lightboxRef}
            className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={(event) => syncIndex(event.currentTarget)}
          >
            {images.map((image) => (
              <div
                key={image.id}
                className="flex h-full w-full shrink-0 snap-center items-center justify-center p-6 pb-28"
              >
                <ProductPhoto
                  url={image.url}
                  alt={imageAlt(image, title, locale)}
                  color={color}
                  className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
                />
              </div>
            ))}
          </div>
          {images.length > 1 ? (
            <>
              <GalleryStep
                label={copy.shop.previousImage}
                disabled={index === 0}
                className="start-4 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
                onClick={() => goTo(index - 1, lightboxRef.current)}
              >
                <PreviousIcon className="size-4.5" />
              </GalleryStep>
              <GalleryStep
                label={copy.shop.nextImage}
                disabled={index === images.length - 1}
                className="end-4 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
                onClick={() => goTo(index + 1, lightboxRef.current)}
              >
                <NextIcon className="size-4.5" />
              </GalleryStep>
              <GalleryThumbs
                images={images}
                index={index}
                title={title}
                color={color}
                locale={locale}
                className="absolute inset-x-0 bottom-6 z-10 justify-center"
                selectedClassName="ring-white ring-2 ring-offset-2 ring-offset-black"
                onSelect={(imageIndex) => goTo(imageIndex, lightboxRef.current)}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function GalleryStep({
  label,
  disabled,
  className,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  className: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={`absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-md transition-all duration-150 hover:bg-background hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function GalleryThumbs({
  images,
  index,
  title,
  color,
  locale,
  className,
  selectedClassName = "ring-foreground ring-2 ring-offset-2 ring-offset-background",
  onSelect,
}: {
  images: TProductImage[];
  index: number;
  title: string;
  color: string;
  locale: TLocale;
  className?: string;
  selectedClassName?: string;
  onSelect: (imageIndex: number) => void;
}) {
  return (
    <div className={cn("flex justify-start gap-2.5 overflow-x-auto py-1", className)}>
      {images.map((image, imageIndex) => {
        const isSelected = imageIndex === index;

        return (
          <button
            key={image.id}
            type="button"
            aria-label={imageAlt(image, title, locale)}
            aria-current={isSelected}
            className={cn(
              "size-16 shrink-0 overflow-hidden rounded-xl transition-all duration-200 active:scale-95 focus:outline-none",
              isSelected ? selectedClassName : "opacity-60 hover:opacity-100",
            )}
            onClick={() => onSelect(imageIndex)}
          >
            <ProductPhoto url={image.url} alt="" color={color} className="size-full object-cover" />
          </button>
        );
      })}
    </div>
  );
}

function imageAlt(image: TProductImage, title: string, locale: TLocale) {
  const alt = locale === "fa" ? image.altFa : image.altEn;
  return alt.trim() || title;
}

function indexFromScroll(scroller: HTMLDivElement) {
  const bounds = scroller.getBoundingClientRect();
  const midpoint = bounds.left + bounds.width / 2;
  let closest = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const [childIndex, child] of [...scroller.children].entries()) {
    const childBounds = child.getBoundingClientRect();
    const distance = Math.abs(childBounds.left + childBounds.width / 2 - midpoint);
    if (distance < closestDistance) {
      closest = childIndex;
      closestDistance = distance;
    }
  }

  return closest;
}
