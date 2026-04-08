import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  initials: string;
  church: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'ChurchFinder helped my family find a welcoming community after we moved to San Antonio. We visited three churches and found our home on the first Sunday.',
    name: 'Maria G.',
    initials: 'MG',
    church: 'San Fernando Cathedral',
  },
  {
    quote:
      "I hadn't been to church in years, but the detailed profiles and honest reviews gave me the confidence to try again. So grateful for this resource.",
    name: 'James T.',
    initials: 'JT',
    church: 'Oak Hills Church',
  },
  {
    quote:
      'The comparison feature was a game changer. Being able to see service times, denominations, and reviews side by side saved us so much time.',
    name: 'Sarah & David K.',
    initials: 'SK',
    church: 'Community Bible Church',
  },
  {
    quote:
      'As a college student new to SA, I used the filters to find a young adults ministry. Found an amazing community at Cornerstone within weeks!',
    name: 'Ashley R.',
    initials: 'AR',
    church: 'Cornerstone Church',
  },
];

export const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="mx-auto max-w-[1760px] px-4 py-12 sm:px-6 lg:px-10">
      <h2 className="mb-8 text-center text-[22px] font-bold">What our community says</h2>
      <div
        className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl"
        style={{ background: 'linear-gradient(to right, #E61E4D, #E31C5F, #D70466)' }}
      >
        <div className="relative px-12 py-12 sm:px-16">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="min-w-full px-4 text-center text-white">
                <p className="text-[20px] italic leading-[1.6]">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 text-sm font-bold text-white">
                    {t.initials}
                  </div>
                  <div className="text-left">
                    <div className="text-[15px] font-semibold">{t.name}</div>
                    <div className="text-[13px] text-white/75">{t.church}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur transition-colors hover:bg-white/40"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur transition-colors hover:bg-white/40"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-center gap-2 pb-6">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                i === current ? 'scale-[1.2] bg-white' : 'bg-white/40'
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
