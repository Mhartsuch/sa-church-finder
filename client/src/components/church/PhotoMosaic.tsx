import { Grid3x3 } from 'lucide-react';
import { useState } from 'react';

import { PhotoPlaceholder } from '@/components/church/PhotoCarousel';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

interface PhotoMosaicProps {
  photos: { url: string; alt: string }[];
  name: string;
}

/** Airbnb listing hero: one large photo plus a 2×2 grid, with a full gallery modal. */
export const PhotoMosaic = ({ photos, name }: PhotoMosaicProps) => {
  const [galleryOpen, setGalleryOpen] = useState(false);

  if (!photos.length) {
    return <PhotoPlaceholder name={name} className="h-[200px] rounded-2xl sm:h-[280px]" />;
  }

  const [hero, ...rest] = photos;
  const thumbs = rest.slice(0, 4);
  const tile = 'h-full w-full object-cover transition hover:brightness-90 cursor-pointer';

  return (
    <>
      <div
        className={cn(
          'relative grid h-[280px] gap-2 overflow-hidden rounded-2xl sm:h-[420px]',
          thumbs.length >= 4
            ? 'md:grid-cols-4 md:grid-rows-2'
            : thumbs.length
              ? 'md:grid-cols-2'
              : '',
        )}
      >
        <button
          type="button"
          onClick={() => setGalleryOpen(true)}
          className={cn('h-full w-full', thumbs.length >= 4 && 'md:col-span-2 md:row-span-2')}
        >
          {/* React 18 only knows the lowercase attribute; the camelCase prop logs a warning. */}
          <img src={hero.url} alt={hero.alt} {...{ fetchpriority: 'high' }} className={tile} />
        </button>
        {thumbs.length >= 4
          ? thumbs.map((photo) => (
              <button
                key={photo.url}
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="hidden md:block"
              >
                <img src={photo.url} alt="" loading="lazy" className={tile} />
              </button>
            ))
          : thumbs.slice(0, 1).map((photo) => (
              <button
                key={photo.url}
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="hidden md:block"
              >
                <img src={photo.url} alt="" loading="lazy" className={tile} />
              </button>
            ))}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-gray-900 bg-white px-4 py-1.5 text-sm font-semibold hover:bg-gray-50"
          >
            <Grid3x3 className="h-4 w-4" /> Show all {photos.length} photos
          </button>
        )}
      </div>

      <Modal open={galleryOpen} onClose={() => setGalleryOpen(false)} title={name} size="full">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 p-4 sm:p-8">
          {photos.map((photo, i) => (
            <img
              key={photo.url}
              src={photo.url}
              alt={photo.alt}
              loading="lazy"
              className={cn(
                'w-full rounded-md object-cover',
                i % 3 === 0 ? 'col-span-2 aspect-[3/2]' : 'aspect-square',
              )}
            />
          ))}
        </div>
      </Modal>
    </>
  );
};
