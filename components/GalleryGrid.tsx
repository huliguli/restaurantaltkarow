import Image from "next/image";
import type { GalleryImage } from "@/content/gallery";

type Props = {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
};

// Erweiterbares Masonry-Style-Grid. Neue Bilder in /content/gallery.ts ergänzen —
// das Grid skaliert automatisch responsiv.
export function GalleryGrid({ images, columns = 3 }: Props) {
  const colsClass =
    columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === 2
      ? "sm:grid-cols-2"
      : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 ${colsClass} gap-4 sm:gap-6`}>
      {images.map((img, i) => (
        <figure
          key={img.src}
          className="group relative overflow-hidden rounded-sm bg-cream-deep shadow-soft"
          style={{
            aspectRatio:
              i % 5 === 0 ? "4 / 5" : i % 3 === 0 ? "1 / 1" : "4 / 3",
          }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {img.caption ? (
            <figcaption
              className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/65 to-transparent text-paper text-sm font-serif italic opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                fontWeight: 500,
                textShadow: "0 2px 10px rgba(0,0,0,0.6)",
              }}
            >
              {img.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
