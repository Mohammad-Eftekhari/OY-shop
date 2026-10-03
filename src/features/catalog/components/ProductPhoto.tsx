type TProductPhotoProps = {
  url?: string;
  alt: string;
  color: string;
  className?: string;
};

export const ProductPhoto = ({ url, alt, color, className }: TProductPhotoProps) => {
  if (!url) {
    return (
      <div className={className} style={{ backgroundColor: color }} role="img" aria-label={alt} />
    );
  }

  return (
    // Product photos are shopper-supplied URLs, so they are not passed through the image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className={className} />
  );
};
