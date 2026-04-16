import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react';
import { ArrowRight, Search, Star } from 'lucide-react';
import MapGL, {
  GeolocateControl,
  MapRef,
  Marker,
  NavigationControl,
  Popup,
  ViewStateChangeEvent,
} from 'react-map-gl';
import { useNavigate } from 'react-router-dom';

import { loadMapboxGl } from '@/lib/load-mapbox-gl';
import { MapBounds, useSearchStore } from '@/stores/search-store';
import { IChurchSummary } from '@/types/church';
import { formatDistance, formatRating, getNextService } from '@/utils/format';

// Bounds are considered "the same" within this tolerance — avoids showing the
// "Search this area" button for trivial wobble from click events or pixel rounding.
const BOUNDS_EQUAL_THRESHOLD = 0.0005;

const boundsRoughlyEqual = (a: MapBounds, b: MapBounds) =>
  Math.abs(a.swLat - b.swLat) < BOUNDS_EQUAL_THRESHOLD &&
  Math.abs(a.swLng - b.swLng) < BOUNDS_EQUAL_THRESHOLD &&
  Math.abs(a.neLat - b.neLat) < BOUNDS_EQUAL_THRESHOLD &&
  Math.abs(a.neLng - b.neLng) < BOUNDS_EQUAL_THRESHOLD;

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;
const mapboxGlPromise = loadMapboxGl() as NonNullable<ComponentProps<typeof MapGL>['mapLib']>;

const getShortLabel = (name: string) => {
  const stripped = name
    .replace(/\b(Church|Cathedral|Mission|Episcopal|Baptist|Methodist|Saint|St\.?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const words = (stripped || name).split(' ').filter(Boolean);
  return words.slice(0, 2).join(' ');
};

interface InteractiveMapProps {
  churches: IChurchSummary[];
}

export const InteractiveMap = ({ churches }: InteractiveMapProps) => {
  const mapRef = useRef<MapRef>(null);
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const mapCenter = useSearchStore((state) => state.mapCenter);
  const mapZoom = useSearchStore((state) => state.mapZoom);
  const mapBounds = useSearchStore((state) => state.mapBounds);
  const hoveredChurchId = useSearchStore((state) => state.hoveredChurchId);
  const selectedChurchId = useSearchStore((state) => state.selectedChurchId);

  const setMapCenter = useSearchStore((state) => state.setMapCenter);
  const setMapZoom = useSearchStore((state) => state.setMapZoom);
  const setMapBounds = useSearchStore((state) => state.setMapBounds);
  const setHoveredChurch = useSearchStore((state) => state.setHoveredChurch);
  const setSelectedChurch = useSearchStore((state) => state.setSelectedChurch);

  const [popupChurch, setPopupChurch] = useState<IChurchSummary | null>(null);
  // Bounds the user has panned/zoomed to but not yet applied.
  // When non-null, a "Search this area" button is shown.
  const [pendingBounds, setPendingBounds] = useState<MapBounds | null>(null);
  // Center/zoom captured alongside the pending bounds, so applying restores
  // the viewport the user was actually looking at even after remount.
  const pendingViewRef = useRef<{ lat: number; lng: number; zoom: number } | null>(null);

  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (popupChurch && !churches.some((church) => church.id === popupChurch.id)) {
      setPopupChurch(null);
      setSelectedChurch(null);
    }
  }, [churches, popupChurch, setSelectedChurch]);

  const readCurrentBounds = useCallback((): MapBounds | null => {
    const map = mapRef.current?.getMap();
    const bounds = map?.getBounds();
    if (!bounds) {
      return null;
    }
    return {
      swLat: bounds.getSouthWest().lat,
      swLng: bounds.getSouthWest().lng,
      neLat: bounds.getNorthEast().lat,
      neLng: bounds.getNorthEast().lng,
    };
  }, []);

  const handleMoveEnd = useCallback(
    (event: ViewStateChangeEvent) => {
      const { latitude, longitude, zoom } = event.viewState;

      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }

      moveTimeoutRef.current = setTimeout(() => {
        setMapCenter(latitude, longitude);
        setMapZoom(zoom);

        const nextBounds = readCurrentBounds();
        if (!nextBounds) {
          return;
        }

        // If the new bounds roughly match the applied bounds, the user has
        // panned back — no need to offer a "Search this area" button.
        if (mapBounds && boundsRoughlyEqual(nextBounds, mapBounds)) {
          pendingViewRef.current = null;
          setPendingBounds(null);
          return;
        }

        pendingViewRef.current = { lat: latitude, lng: longitude, zoom };
        setPendingBounds(nextBounds);
      }, 300);
    },
    [mapBounds, readCurrentBounds, setMapCenter, setMapZoom],
  );

  const handleLoad = useCallback(() => {
    const nextBounds = readCurrentBounds();
    if (!nextBounds) {
      return;
    }

    // On first mount, always apply the initial bounds so the list reflects
    // exactly what's shown on the map — even if the user never interacts with it.
    setMapBounds(nextBounds);
    pendingViewRef.current = null;
    setPendingBounds(null);
  }, [readCurrentBounds, setMapBounds]);

  const handleSearchThisArea = useCallback(() => {
    if (!pendingBounds) {
      return;
    }

    const view = pendingViewRef.current;
    if (view) {
      setMapCenter(view.lat, view.lng);
      setMapZoom(view.zoom);
    }

    setMapBounds(pendingBounds);
    pendingViewRef.current = null;
    setPendingBounds(null);
  }, [pendingBounds, setMapBounds, setMapCenter, setMapZoom]);

  return (
    <div className="relative h-full w-full">
      <MapGL
        ref={mapRef}
        initialViewState={{
          latitude: mapCenter.lat,
          longitude: mapCenter.lng,
          zoom: mapZoom,
        }}
        mapLib={mapboxGlPromise}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        onMoveEnd={handleMoveEnd}
        onLoad={handleLoad}
        onClick={() => {
          setPopupChurch(null);
          setSelectedChurch(null);
        }}
        attributionControl={false}
        reuseMaps
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl position="bottom-right" trackUserLocation={false} />

        {churches.map((church) => {
          const isActive = church.id === hoveredChurchId || church.id === selectedChurchId;
          const markerLabel =
            church.avgRating > 0 ? formatRating(church.avgRating) : getShortLabel(church.name);

          return (
            <Marker
              key={church.id}
              longitude={church.longitude}
              latitude={church.latitude}
              anchor="bottom"
            >
              <button
                type="button"
                onMouseEnter={() => setHoveredChurch(church.id)}
                onMouseLeave={() => setHoveredChurch(null)}
                onFocus={() => setHoveredChurch(church.id)}
                onBlur={() => setHoveredChurch(null)}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedChurch(church.id);
                  setPopupChurch(church);
                }}
                className={`inline-flex min-w-[54px] items-center gap-1 rounded-full border bg-white px-3 py-1 text-xs font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform ${
                  isActive
                    ? 'scale-105 border-[#111111] text-[#111111]'
                    : 'border-[#4b5563] text-[#111111]'
                }`}
                aria-label={`Open ${church.name} on the map`}
              >
                {church.avgRating > 0 ? (
                  <Star className="h-3 w-3 fill-[#FF385C] text-[#FF385C]" />
                ) : null}
                <span>{markerLabel}</span>
              </button>
            </Marker>
          );
        })}

        {popupChurch && (
          <Popup
            longitude={popupChurch.longitude}
            latitude={popupChurch.latitude}
            anchor="bottom"
            onClose={() => {
              setPopupChurch(null);
              setSelectedChurch(null);
            }}
            closeOnClick={false}
            className="church-popup"
            maxWidth="280px"
          >
            <button
              type="button"
              className="w-full cursor-pointer rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222] focus-visible:ring-offset-2"
              onClick={() => navigate(`/churches/${popupChurch.slug}`)}
              aria-label={`View ${popupChurch.name} profile`}
            >
              <h3 className="mb-1 text-[15px] font-semibold leading-tight text-foreground">
                {popupChurch.name}
              </h3>
              {popupChurch.denomination && (
                <p className="mb-0.5 text-[13px] text-muted-foreground">
                  {popupChurch.denomination}
                </p>
              )}
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                {popupChurch.avgRating > 0 && (
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                    <Star className="h-3 w-3 fill-current" />
                    {formatRating(popupChurch.avgRating)}
                  </span>
                )}
                <span>{formatDistance(popupChurch.distance)} away</span>
              </div>
              {(() => {
                const nextService = getNextService(popupChurch.services);
                return nextService ? (
                  <p className="mt-1 text-[13px] font-semibold text-foreground">{nextService}</p>
                ) : null;
              })()}
              <span className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-[#FF385C]">
                View profile
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </Popup>
        )}
      </MapGL>

      {pendingBounds ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4">
          <button
            type="button"
            onClick={handleSearchThisArea}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-[13px] font-semibold text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222] focus-visible:ring-offset-2"
            aria-label="Search churches in this map area"
          >
            <Search className="h-4 w-4" />
            Search this area
          </button>
        </div>
      ) : null}
    </div>
  );
};
