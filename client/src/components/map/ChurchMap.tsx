import { MapPinOff, Star, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { PhotoPlaceholder } from '@/components/church/PhotoCarousel';
import { churchPhotos, churchSubtitle, formatRating, getRating } from '@/lib/format';
import { loadMapboxGl } from '@/lib/load-mapbox-gl';
import { IChurchSummary } from '@/types/church';

/** The slice of the Mapbox GL API this component uses (the library is loaded from CDN). */
interface LngLatBounds {
  getSouth(): number;
  getWest(): number;
  getNorth(): number;
  getEast(): number;
}
interface MapboxMap {
  on(event: 'moveend', handler: (event: { originalEvent?: unknown }) => void): void;
  on(event: 'load', handler: () => void): void;
  getBounds(): LngLatBounds;
  addControl(control: unknown, position?: string): void;
  resize(): void;
  remove(): void;
}
interface MapboxMarker {
  setLngLat(lngLat: [number, number]): MapboxMarker;
  addTo(map: MapboxMap): MapboxMarker;
  remove(): void;
}
type MapboxGl = {
  accessToken?: string;
  Map: new (options: Record<string, unknown>) => MapboxMap;
  Marker: new (options: { element: HTMLElement; anchor?: string }) => MapboxMarker;
  NavigationControl: new (options?: Record<string, unknown>) => unknown;
};

const SAN_ANTONIO: [number, number] = [-98.4936, 29.4241];
const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface ChurchMapProps {
  churches: IChurchSummary[];
  highlightedId: string | null;
  onBoundsChange: (bounds: string) => void;
}

export const ChurchMap = ({ churches, highlightedId, onBoundsChange }: ChurchMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ map: MapboxMap; gl: MapboxGl } | null>(null);
  const markersRef = useRef(new Map<string, { marker: MapboxMarker; el: HTMLButtonElement }>());
  const boundsCallback = useRef(onBoundsChange);
  boundsCallback.current = onBoundsChange;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(!TOKEN);
  const [selected, setSelected] = useState<IChurchSummary | null>(null);

  useEffect(() => {
    if (!TOKEN || !containerRef.current) return;
    let cancelled = false;
    const markers = markersRef.current;

    loadMapboxGl()
      .then((loaded) => {
        if (cancelled || !containerRef.current) return;
        const gl = loaded as unknown as MapboxGl;
        gl.accessToken = TOKEN;
        const map = new gl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: SAN_ANTONIO,
          zoom: 10.2,
          attributionControl: true,
        });
        map.addControl(new gl.NavigationControl({ showCompass: false }), 'top-right');
        map.on('moveend', (event) => {
          if (!event.originalEvent) return;
          const b = map.getBounds();
          boundsCallback.current(
            [b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]
              .map((n) => n.toFixed(5))
              .join(','),
          );
        });
        map.on('load', () => setReady(true));
        mapRef.current = { map, gl };
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
      markers.forEach(({ marker }) => marker.remove());
      markers.clear();
      mapRef.current?.map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync markers with the current result set.
  useEffect(() => {
    const current = mapRef.current;
    if (!ready || !current) return;
    const markers = markersRef.current;
    const ids = new Set(churches.map((church) => church.id));

    markers.forEach((entry, id) => {
      if (!ids.has(id)) {
        entry.marker.remove();
        markers.delete(id);
      }
    });

    for (const church of churches) {
      if (markers.has(church.id)) continue;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'church-pin';
      const rating = getRating(church);
      el.textContent = rating ? `★ ${formatRating(rating.value)}` : '⛪';
      el.setAttribute('aria-label', church.name);
      el.addEventListener('click', (event) => {
        event.stopPropagation();
        setSelected(church);
      });
      const marker = new current.gl.Marker({ element: el, anchor: 'center' })
        .setLngLat([church.longitude, church.latitude])
        .addTo(current.map);
      markers.set(church.id, { marker, el });
    }
  }, [churches, ready]);

  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
      el.classList.toggle('is-active', id === highlightedId || id === selected?.id);
    });
  }, [highlightedId, selected, churches]);

  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-stone-100 text-gray-500">
        <MapPinOff className="h-8 w-8" strokeWidth={1.5} />
        <p className="text-sm">The map is unavailable right now.</p>
      </div>
    );
  }

  const selectedPhoto = selected ? churchPhotos(selected)[0] : undefined;
  const selectedRating = selected ? getRating(selected) : null;

  return (
    <div className="relative h-full w-full bg-stone-100">
      <div ref={containerRef} className="h-full w-full" />
      {selected && (
        <div className="absolute inset-x-4 bottom-6 mx-auto max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl animate-rise">
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setSelected(null)}
            className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 shadow"
          >
            <X className="h-3.5 w-3.5" strokeWidth={3} />
          </button>
          <Link to={`/churches/${selected.slug}`} className="flex">
            <div className="h-28 w-28 shrink-0 overflow-hidden">
              {selectedPhoto ? (
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.alt}
                  className="h-full w-full object-cover"
                />
              ) : (
                <PhotoPlaceholder name="" />
              )}
            </div>
            <div className="min-w-0 p-4 text-sm">
              <p className="truncate font-semibold">{selected.name}</p>
              <p className="truncate text-gray-500">{churchSubtitle(selected)}</p>
              {selectedRating && (
                <p className="mt-2 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" /> {formatRating(selectedRating.value)}
                  <span className="text-gray-500">({selectedRating.count})</span>
                </p>
              )}
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};
