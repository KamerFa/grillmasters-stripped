"use client";

import { useState } from "react";

const FALLBACK_IMAGE = "/images/products/placeholder-1.svg";

const BACKDROP_COLORS = [
  "bg-rose-100/60",
  "bg-amber-100/60",
  "bg-emerald-100/60",
  "bg-sky-100/60",
  "bg-violet-100/60",
  "bg-orange-100/60",
];

function getBackdropColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BACKDROP_COLORS[Math.abs(hash) % BACKDROP_COLORS.length];
}

interface ProductImageGalleryProps {
  productId: string;
  images: { id: string; url: string }[];
  alt: string;
}

export function ProductImageGallery({ productId, images, alt }: ProductImageGalleryProps) {
  const [mainError, setMainError] = useState(false);
  const [thumbErrors, setThumbErrors] = useState<Record<string, boolean>>({});

  const mainUrl = images[0]?.url;

  return (
    <div className="space-y-4">
      <div className={`relative aspect-square overflow-hidden rounded-lg ${getBackdropColor(productId)}`}>
        <img
          src={mainError || !mainUrl ? FALLBACK_IMAGE : mainUrl}
          alt={alt}
          className="object-contain w-full h-full p-4"
          onError={() => setMainError(true)}
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, idx) => (
            <div
              key={img.id}
              className={`relative aspect-square overflow-hidden rounded-md ${BACKDROP_COLORS[(Math.abs(idx) + 1) % BACKDROP_COLORS.length]}`}
            >
              <img
                src={thumbErrors[img.id] ? FALLBACK_IMAGE : img.url}
                alt={alt}
                className="object-contain w-full h-full p-2"
                onError={() => setThumbErrors((prev) => ({ ...prev, [img.id]: true }))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
