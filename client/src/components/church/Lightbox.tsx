import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  alt?: string;
  onClose: () => void;
}

export const Lightbox = ({ images, initialIndex = 0, alt = 'Photo', onClose }: LightboxProps) => {
  const [current, setCurrent] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
    setZoomed(false);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
    setZoomed(false);
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-black/95" onClick={onClose}>
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
          aria-label="Close lightbox"
        >
          <X className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-white/80">
          {current + 1} / {images.length}
        </span>
        <div className="w-10" />
      </div>

      {/* Main image */}
      <div
        className="flex flex-1 items-center justify-center px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[current]}
          alt={`${alt} ${current + 1}`}
          className={`max-h-[75vh] max-w-full cursor-zoom-in rounded-lg object-contain transition-transform duration-200 ${
            zoomed ? 'scale-150 cursor-zoom-out' : ''
          }`}
          onClick={() => setZoomed(!zoomed)}
        />
      </div>

      {/* Navigation arrows */}
      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      {/* Thumbnail strip */}
      {images.length > 1 ? (
        <div className="flex justify-center gap-2 p-4">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(i);
                setZoomed(false);
              }}
              className={`h-14 w-14 overflow-hidden rounded-lg border-2 transition-all ${
                i === current
                  ? 'border-white opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-75'
              }`}
            >
              <img src={img} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
